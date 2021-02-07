//
// Code dealing with Polyglot opening books
//

//
// Representation of a single entry in a Polyglot opening book
//
class BookEntry {
    //
    // Build one BookEntry from the binary data slurped from
    // a polyglot opening book starting at byte-offset 'ofs'
    //
    constructor(bookdata, ofs) {
        //
        // Remember where we started from
        //
        this.ofs = ofs
        //
        // Convert key to BigInt (64-bit) value
        //
        var key = BigInt(0);
        var i;
        for(i = 0; i < 8; ++i) {
            var byt = bookdata.charCodeAt(ofs++);
            key = (key << BigInt(8)) | BigInt(byt);
        }
	this.key = key;
        var raw_move = 0;
        for(i = 0; i < 2; ++i) {
            var byt = bookdata.charCodeAt(ofs++);
            raw_move = (raw_move << 8) | byt;
        }
	this.raw_move = raw_move;
        var weight = 0;
        for(i = 0; i < 2; ++i) {
            var byt = bookdata.charCodeAt(ofs++);
            weight = (weight << 8) | byt;
        }
	this.weight = weight;
        var learn = 0;
        for(i = 0; i < 4; ++i) {
            var byt = bookdata.charCodeAt(ofs++);
            learn = (learn << 8) | byt;
        }
	this.learn = learn;
    }
    //
    // Various accessor methods
    //
    get_offset() {
        return this.ofs;
    }
    get_key() {
        return this.key;
    }
    get_raw_move() {
        return this.raw_move;
    }
    get_weight() {
        return this.weight;
    }
    get_learn() {
        return this.learn;
    }
    get_size() {
        return 16;
    }
    get_from_row() {
        return (this.raw_move >> 9) & 0x0007;
    }
    get_from_col() {
        return (this.raw_move >> 6) & 0x0007;
    }
    get_to_row() {
        return (this.raw_move >> 3) & 0x0007;
    }
    get_to_col() {
        return this.raw_move & 0x0007;
    }
    get_promo_piece() {
        return(this.raw_move >> 12) & 0x0007;
    }
    //
    // Polyglot uses its own convention for castling: provide
    // accessor methods for finding out which type of castling
    // is encoded in current move.
    //
    isOOW() {
        var m = this.raw_move;
        return (m === 0x0107);
    }
    isOOB() {
        var m = this.raw_move;
        return (m === 0x0f3f);
    }
    isOOOW() {
        var m = this.raw_move;
        return (m === 0x0100);
    }
    isOOOB() {
        var m = this.raw_move;
        return (m === 0x0f38);
    }
    //
    // Convert Polyglot move to human readable format.
    //
    get_move() {
        var m = this.raw_move;
        var move_str = "";
        if((m === 0x0107) || (m === 0x0f3f)) {
            move_str = "O-O";
        } else if((m === 0x0100) || (m === 0x0f38)) {
            move_str = "O-O-O";
        } else {
            var promo_piece = this.get_promo_piece();
            move_str = "abcdefgh".charAt(this.get_from_col()) + "12345678".charAt(this.get_from_row()) + "-" + "abcdefgh".charAt(this.get_to_col()) + "12345678".charAt(this.get_to_row())
            if(promo_piece > 0) {
                move_str = move_str + "=" + "-NBRQ".charAt(promo_piece);
            }
        }
        return move_str;
    }
    //
    // Convert Polyglot move to Move object (as defined in sbboard.js)
    //
    to_move() {
        var f = Board.to_square_idx(this.get_from_row(), this.get_from_col());
        var t = Board.to_square_idx(this.get_to_row(), this.get_to_col());
        var mv;
        if(this.isOOW()) {
	    mv = new Move(C.POS_E1, C.POS_G1);
	    mv.setCastling(C.SHORT_CASTLING);
        } else if(this.isOOB()) {
	    mv = new Move(C.POS_E8, C.POS_G8);
	    mv.setCastling(C.SHORT_CASTLING);
        } else if(this.isOOOW()) {
	    mv = new Move(C.POS_E1, C.POS_C1);
	    mv.setCastling(C.LONG_CASTLING);
        } else if(this.isOOOB()) {
	    mv = new Move(C.POS_E8, C.POS_C8);
	    mv.setCastling(C.LONG_CASTLING);
        } else {
            mv = new Move(f, t);
        }
        return mv;
    }
}
//
// representation of a Polyglot binary opening book
//
class Book {
    constructor(bookdata) {
        this.bookdata = bookdata;
        this.cache = new Array();	// cache so that we parse each entry at most one time
        if(this.bookdata.length >= 32) {
            this.first = new BookEntry(this.bookdata, 0);
            this.last = new BookEntry(this.bookdata, this.get_last_index());
        } else {
            this.first = null;
            this.last = null;
        }
    }
    get_data() {
        return this.bookdata;
    }
    get_length() {
        return this.bookdata.length / 16;
    }
    get_last_index() {
        return this.get_length() - 1;
    }
    get_offset(idx) {
        return idx * 16;
    }
    get_entry(idx) {
        var e = undefined;
        if(this.cache[idx] === undefined){
            e = new BookEntry(this.bookdata, this.get_offset(idx));
            this.cache[idx] = e;
        } else {
            e = this.cache[idx];
        }
        return e;
    }
    //
    // Retrieve the index of the first occurrence of the specified hash,
    // or -1 if not found.
    //
    // weed = BigInt (64-bit integer) with the hash to locate
    //
    find_first_hash(weed) {
        if(this.first === null || this.last === null) {
            return -1;
        }
        if(weed < this.first || weed > this.last) {
            return -1;
        }
        if(weed == this.first) {
            return 0;
        }
        var i0 = 0;
        var i1 = (this.bookdata.length / 16) - 1;
        var i = i1;
        var ky = 0n;	// need a BigInt here
        //
        // If the last entry matches the searched hash value,
        // we can skip the binary search and go straight to
        // the part where we move up in the list of same hash
        // values until we find the first in the list.
        //
        if(weed != this.last) {
            //
            // Stop looping if only 2 elements are in the inspection range:
            // both endpoints will have been compared to the wanted hash value
            // and both endpoints of the range will have a different hash. So,
            // if there are only two left, and both have previously been confirmed
            // to be different from the wanted hash, that means that the hash is
            // not in the table and we can safely bail out of the loop.
            //
            while(i1 - i0 > 1) {
                i = Math.floor((i0 + i1) /2);	// this is javascript for you: no int arithmetic
                var e = this.get_entry(i);
                ky = e.get_key();
                if(ky == weed) {
                    //
                    // Found an entry with the wanted hash: stop looping
                    //
                    break;
                }
                //
                // Not found, so continue with half the current range
                //
                if(ky < weed) {
                    i0 = i;
                } else {
                    i1 = i;
                }
            }
        }
        //
        // No need to go up in the table if not found
        //
        if(ky != weed) {
            return -1;
        }
        //
        // Move up in table until different key found
        //
        while(i > 0) {
            if(this.get_entry(i - 1).get_key() == weed) {
                i = i - 1;
            } else {
                break;
            }
        }
        return i;
    }
    //
    // Get all entries for given FEN position
    //
    get_all_moves(weed) {
        var i = this.find_first_hash(weed);
        if(i  < 0) {
            return undefined;
        }
        var lst = new Array();
        var e = this.get_entry(i);
        while((e !== undefined) && (e.get_key() == weed)) {
            lst.push(e);
            e = this.get_entry(++i);
        }
        return lst;
    }
}
