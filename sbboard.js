//
// Copyright (c) 2021 Eddy Vanlerberghe.  All rights reserved.
//
// Redistribution and use in source and binary forms, with or without
// modification, are permitted provided that the following conditions
// are met:
// 1. Redistributions of source code must retain the above copyright
//    notice, this list of conditions and the following disclaimer.
// 2. Redistributions in binary form must reproduce the above copyright
//    notice, this list of conditions and the following disclaimer in the
//    documentation and/or other materials provided with the distribution.
// 3. The name of Eddy Vanlerberghe shall not be used to endorse or promote
//    products derived from this software without specific prior written
//    permission.
//
// THIS SOFTWARE IS PROVIDED BY EDDY VANLERBERGHE ``AS IS'' AND
// ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
// IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
// ARE DISCLAIMED.  IN NO EVENT SHALL EDDY VANLERBERGHE BE LIABLE
// FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
// DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS
// OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION)
// HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT
// LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY
// OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF
// SUCH DAMAGE.
//

//////////////////////////////////////////////////
//
// Chess board related stuff
//
// This code deals with the internal representation of things.
//
//////////////////////////////////////////////////

//
////////////////////////////////////////////////////
//
// Class for side specific options
//
////////////////////////////////////////////////////
//
class Side {
    constructor(iswhite) {
        this.iswhite = iswhite;
        this.kingcastle = 1;
        this.queencastle = 1;
        this.longpawnfile = -1;
    }

    canOO() {
	return this.kingcastle;
    }
    setOO() {
	this.kingcastle = 1;
    }
    delOO() {
	this.kingcastle = 0;
    }
    canOOO() {
	return this.queencastle;
    }
    setOOO() {
	this.queencastle = 1;
    }
    delOOO() {
	this.queencastle = 0;
    }
    canBeTakenEP() {
	return (this.longpawnfile != -1);
    }
    clearEP() {
	this.longpawnfile = -1;
    }
    setEPFile(epfile) {
	this.longpawnfile = epfile;
    }
    getEPFile() {
	return this.longpawnfile;
    }
    dup() {
	var n = new Side(this.iswhite);
	n.kingcastle = this.kingcastle;
	n.queencastle = this.queencastle;
	n.longpawnfile = this.longpawnfile;
	return n;
    }
    //
    // Debugging aid: dump contents of board
    //
    toString() {
	var s = "Side: " + (this.iswhite? "W" : "B");
	s += ", O-O? " + this.canOO();
	s += ", O-O-O? " + this.canOOO();
	s += ", EP-file: " + this.longpawnfile;
	return s;
    }
}
//////////////////////////////////////////////////
//
// Move class
//
//////////////////////////////////////////////////

class Move {
    constructor(f, t) {
        this.from = f;
        this.hint = "";
        this.text = "";
        this.to = t;
        this.isEP = 0;
        this.promotedTo = C.EMPTY;
        this.piece_captured = C.EMPTY;
        this.castling = C.NO_CASTLING;
        this.hint = null;
        this.saved_side2move = C.WHITE;
        this.saved_halfmoveclock = 0;
        this.saved_movenr = 0;
        this.saved_ep = 0;
        this.saved_sidew = null;
        this.saved_sideb = null;
        this.weight = 0;	// can be set from Polyglot move
    }

    //
    // Custom serialization code
    //
    //toJSON() {
    //var out = {};
    //out['from'] = this.from;
    //out['to'] = this.to;
    //out['promotedTo'] = this.promotedTo;
    //out['hint'] = this.hint;
    //return out;
    //}
    saveBoard(b) {
	this.saved_side2move = b.side2move;
	this.saved_halfmoveclock = b.halfmove_clock;
	this.saved_movenr = b.move_nr;
	this.saved_ep = b.ep;
	this.saved_sidew = b.side_white.dup();
	this.saved_sideb = b.side_black.dup();
    }
    undoBoard(b) {
	b.side2move = this.saved_side2move;
	b.halfmove_clock = this.saved_halfmoveclock;
	b.move_nr = this.saved_movenr;
	b.ep = this.saved_ep;
	b.side_white = this.saved_sidew.dup();
	b.side_black = this.saved_sideb.dup();
    }
    equals(m) {
	return (this.from == m.from) &&
	    (this.to == m.to) &&
	    (this.promotedTo == m.promotedTo);
    }
    getFrom() {
	return this.from;
    }

    getTo() {
	return this.to;
    }

    setEP(ep){
	this.isEP = ep;
    }
    getEP() {
	return this.isEP;
    }
    setCapturedPiece(p) {
	this.piece_captured = p;
    }

    getCapturedPiece() {
	return this.piece_captured;
    }

    setPromotedTo(p) {
	this.promotedTo = p;
    }

    getPromotedTo() {
	return this.promotedTo;
    }
    setCastling(code) {
	this.castling = code;
    }
    getCastling() {
	return this.castling;
    }
    isOO() {
	return (this.castling == C.SHORT_CASTLING);
    }
    isOOO() {
	return (this.castling == C.LONG_CASTLING);
    }
    getWeight() {
        return this.weight;
    }
    setWeight(w) {
        this.weight = w;
    }
    toString() {
	//var c0 = this.from >> 3;
	//var r0 = (this.from & 7) + 1;
	//var c1 = this.to >> 3;
	//var r1 = (this.to & 7) + 1;
	if(this.getCastling() == C.NO_CASTLING) {
	    return "Move: " + C.i2nam(this.from) + " -> " + C.i2nam(this.to);
	} else if(this.getCastling() == C.SHORT_CASTLING) {
	    return "Move: " + C.i2nam(this.from) + " -> " + C.i2nam(this.to) + " 0-0";
	} else {
	    return "Move: " + C.i2nam(this.from) + " -> " + C.i2nam(this.to) + " 0-0-0";
	}
    }
    //
    // Convert to move to external move in more common long notation.
    // For now, no check indicators are implemented.
    // Assume this Move object is consistent internally, so not a lot of error checking done.
    //
    // "board" is a Board instance
    //
    to_move(board) {
        if(this.isOO()) {
            return "0-0";
        }
        if(this.isOOO()) {
            return "0-0-0";
        }
	var c0 = this.from >> 3;
	var r0 = (this.from & 7) + 1;
	var c1 = this.to >> 3;
	var r1 = (this.to & 7) + 1;
        var brd = board.getBoard();
        var from_square = brd[this.from];
        var to_square = brd[this.to];
        var pce = from_square & C.PIECEMASK;  // note: can never be empty in actual move
        var out = "";
        if(pce < C.PAWN) {
            out += C.FENPIECENAMES.charAt(pce - 1);
        }
        out += C.i2nam(this.from);
        if(((to_square & C.PIECEMASK) == C.EMPTY) && !this.isEP){
            out += "-"
        } else {
            out += "x"
        }
        out += C.i2nam(this.to);
        if(this.isEP) {
            out += "e.p.";
        }
        if(this.promotedTo) {
            out += C.FENPIECENAMES.charAt(pce - 1);
        }
        //return V.text2pic(out);
        return out;
    }
}
//
////////////////////////////////////////////////////
//
// Class for chess board setup internal representation
//
// Internally, the individual cells of a board are stored in
// a one dimensional array. The order is to store column by column,
// where A1 is at position 0, and A8 is at position 7.
//
////////////////////////////////////////////////////
//
//
// Note: if fen is an empty string, the default initial board
// setup is used.
//
class Board {
    constructor(fen) {
        this.fenstring = fen;
        this.side_white = new Side(1);
        this.side_black = new Side(0);
        this.side2move = C.WHITE;
        this.halfmove_clock = 0;
        this.move_nr = 0;
        this.ep = 0;
        this.key = 0n;   // BigInt hash value for Polyglot opening books
        //
        // Contents of chess board.
        //
        // The squares are stored column, by column and starting at
        // square A1.
        // Example: A4 is at position 3, D1 at position 24.
        //
        this.board = [
	    0, 0, 0, 0, 0, 0, 0, 0,	// a1 -> a8
	    0, 0, 0, 0, 0, 0, 0, 0,	// b1 -> b8
	    0, 0, 0, 0, 0, 0, 0, 0,	// c1 -> c8
	    0, 0, 0, 0, 0, 0, 0, 0,	// d1 -> d8
	    0, 0, 0, 0, 0, 0, 0, 0,	// e1 -> e8
	    0, 0, 0, 0, 0, 0, 0, 0,	// f1 -> f8
	    0, 0, 0, 0, 0, 0, 0, 0,	// g1 -> g8
	    0, 0, 0, 0, 0, 0, 0, 0	// h1 -> h8
	];
        this.setupFen(fen);
        this.dynamo = new CBFMoveGenerator();
        this.movelist = this.dynamo.generateMoveList(this.side2move, this);
    }
    //
    // Utility function: convert coordinates into internal square offset.
    //
    // Arguments are zero based (that is: in the range from 0 to 7, included)
    //
    static to_square_idx(row, col) {
	return ((col & 7) << 3 | (row & 7));
    }
    //
    // Convert (row, column) to board cell subscript
    //
    rc2i(r, c) {
	return (c << 3 | r);
    }
    //
    // Convert to human readable format (for debugging purposes)
    //
    toString() {
	var s = "FEN: " + this.fenstring;
	s += "\nboard: " + this.board + "\n";
	for(var i = 7; i >= 0; --i) {
	    for(var j = 0; j < 8; ++j) {
		s += this.board[this.rc2i(i,  j)] + ", ";
	    }
	    s += "\n";
	}
	s += this.side_white.toString() + "\n";
	s += this.side_black.toString() + "\n";
	s += "Side to move: " + this.getSideToMove() + "\n";
	s += "Halfmove clock: " + this.getHalfMoveClock() +
	    ", Move number: " + this.getMoveNumber() + "\n";
	return s;
    }
    getKey() {
	return this.key;
    }
    getBoard() {
	return this.board;
    }
    getEP() {
	return this.ep;
    }
    setSideToMove(c) {
	this.side2move = c;
    }
    getSideToMove() {
	return this.side2move;
    }
    setHalfMoveClock(c) {
	this.halfmove_clock = c;
    }
    incrementHalfMoveClock() {
	++this.halfmove_clock;
    }
    getHalfMoveClock() {
	return this.halfmove_clock;
    }
    setMoveNumber(n) {
	this.move_nr = n;
    }
    incrementMoveNumber() {
	++this.move_nr;
    }
    getMoveNumber() {
	return this.move_nr;
    }
    setOO(c, flag) {
	var side = (c == C.WHITE) ? this.side_white :
	    this.side_black;
	if(!flag) {
	    side.delOO();
	}
    }
    canOO(c) {
	if(c == C.WHITE) {
	    return this.side_white.canOO();
	} else {
	    return this.side_black.canOO();
	}
    }
    setOOO(c, flag) {
	var side = (c == C.WHITE) ? this.side_white : this.side_black;
	if(!flag) {
	    side.delOOO();
	}
    }
    canOOO(c) {
	if(c == C.WHITE) {
	    return this.side_white.canOOO();
	} else {
	    return this.side_black.canOOO();
	}
    }
    isEmptyCell(k) {
	return (this.board[k] == C.EMPTY);
    }
    isWhitePiece(p) {
	return ((p & C.BLACK) != C.BLACK);
    }

    isValidMove(from, to) {
	for(var i = 0; i < this.movelist.length; ++i) {
	    if((this.movelist[i].from == from) &&
	       (this.movelist[i].to == to)) {
		return this.movelist[i];
	    }
	}
	return null;
    }
    findValidMove(from, to, promo) {
	for(var i = 0; i < this.movelist.length; ++i) {
	    if((this.movelist[i].from == from) &&
	       (this.movelist[i].to == to) &&
	       (this.movelist[i].promotedTo == promo)) {
		return this.movelist[i];
	    }
	}
	return null;
    }

    setupFen(fen) {
	//
	// If empty string, use initial board setup.
	//
	if((fen === undefined) || fen.match(/^\s*$/)) {
	    fen = C.FEN_START;
	}
	this.fenstring = fen;
        this.key = compute_fen_hash(this.fenstring);
	//
	// Split FEN in composing sub-parts
	//
	var fenparts = fen.split(/\s+/);
	var rows = fenparts[0].split(/\//);
	var k = 0;
	var s = "";	

	for(var i = 0; i < rows.length ; ++i) {
	    k = (7 - i);		// FEN diagram starts with top row (row 8)
	    for(var j = 0; j < rows[i].length; ++j) {
		var c = rows[i].substr(j, 1);	// wanna do string operations
		if(c.match(/\d/)) {
		    // Got a digit: insert that many empty cells in board setup
		    //var pce = (c.charCodeAt(0)) - ("0".charCodeAt(0));
		    var pce = c;
		    while((pce--) > 0) {
			this.board[k] = C.EMPTY;
			k += 8;	// board stores column by column so next cell on same row is 8 elements further
		    }
		} else {
		    // Got the name of a piece
		    var uc = c.toUpperCase();
		    //var idx = this.FENPIECENAMES.indexOf(uc);
		    var idx = C.FENPIECENAMES.indexOf(uc);
		    if(idx < 0) {
			alert("Found illegal character in FEN. row=" + (i + 1) +
			      ", col=" + (j + 1));
		    }
		    idx++;	// Convert index to piece code
		    if(c != uc) {
			idx |= C.BLACK;
		    } else {
			idx |= C.WHITE;
		    }
		    this.board[k] = idx;
		    k += 8;	// board stores column by column so next cell on same row is 8 elements further
		}
	    }
	}

	this.setSideToMove((fenparts[1] == "w")? C.WHITE: C.BLACK);
	this.setOO(C.WHITE, fenparts[2].match(/K/));
	this.setOO(C.BLACK, fenparts[2].match(/k/));
	this.setOOO(C.WHITE, fenparts[2].match(/Q/));
	this.setOOO(C.BLACK, fenparts[2].match(/q/));
	this.side_white.clearEP();
	this.side_black.clearEP();
	if(fenparts[3] != '-') {
	    if(fenparts[3].match(/3/)) {
		this.side_white.setEPFile("abcdefgh".indexOf(fenparts[3].charAt(0)));
	    } else {
		this.side_black.setEPFile("abcdefgh".indexOf(fenparts[3].charAt(0)));
	    }
	}
	this.setHalfMoveClock(fenparts[4].valueOf());
	this.setMoveNumber(fenparts[5].valueOf());
    }
    //
    // Convert board position to FEN syntax (that is: just the location of the pieces,
    // the first element in a full FEN string)
    //
    toFENBoard() {
	var s = "";

	for(var i = 7; i >= 0; --i) {
	    if(i < 7) {
		s += "/";
	    }
	    var k = i;
	    var n = -1;	// column with first empty cell in current horizontal run of empty cells
	    for(var j = 0; j < 8; ++j) {
		if(this.isEmptyCell(k)) {
		    if(n < 0) {
			n = j;	// remember column of first empty cell in horizontal run of empty squares
		    }
		} else {
		    if(n >= 0) {
			//
			// Reached non-empty square: compute number of empty cells to the left of this cell
			//
			s += (j - n);	// append number of empty squares to FEN output
			n = -1;
		    }
		    //
		    // Encode piece found on square
		    //
		    if(this.isWhitePiece(this.board[k])) {
			s += C.FENPIECENAMES.charAt(this.board[k] - 1);
		    } else {
			s += C.FENPIECENAMES.charAt((this.board[k] ^ C.BLACK) - 1).toLowerCase();
		    }
		}
		k += 8;	// move to next column horizontally
	    }
	    if(n >= 0) {
		//
		// Run of empty squares terminated at end of board
		//
		s += (8 - n);
	    }
	}

	return s;
    }
    //
    // Convert an internal representation to a unique identifying
    // string for the current position. The idea is to use this
    // string to find variations leading to the same position in
    // opening trees.
    //
    // For now, we use the FEN representation minus move number
    // information, but with inclusion of castling and EP
    // information.
    //

    toIdString() {
	var s = this.toFENBoard();
	s += " " + ((this.getSideToMove() == C.WHITE)? "w" : "b") + " ";
	var c = "";
	if(this.canOO(C.WHITE)) {
	    c += "K";
	}
	if(this.canOOO(C.WHITE)) {
	    c += "Q";
	}
	if(this.canOO(C.BLACK)) {
	    c += "k";
	}
	if(this.canOOO(C.BLACK)) {
	    c += "q";
	}
	if(c != "") {
	    s += c + " ";
	} else {
	    s += "- ";
	}
	if(this.side_white.canBeTakenEP()) {
	    s += "abcdefgh".charAt(this.side_white.getEPFile()) + "3";
	} else if (this.side_black.canBeTakenEP()) {
	    s += "abcdefgh".charAt(this.side_black.getEPFile()) + "6";
	} else {
	    s += "-";
	}
	return s;
    }
    //
    // Convert current board position to FEN string
    //
    toFENString() {
	var s = this.toIdString();
	s += " " + this.getHalfMoveClock() + " " +
	    this.getMoveNumber();
	return s;
    }
    //
    // Execute a move on the current board. In doing so, the move
    // properties are updated for storing undo-information.
    //
    doMove(m) {
	//
	// Save current board properties for possible undo operation
	//
	m.saveBoard(this);
	//
	// List to receive squares that have changed contents
	// and need to be redrawn
	//
	var changed_squares = new Array();
	//
	// Clear EP columns for FEN generation
	//
	this.side_white.clearEP();
	this.side_black.clearEP();
	//
	// Register if this is a double pawn move so that the next move
	// could be an en passant capture
	//
	if((this.board[m.getFrom()] & 7) == C.PAWN) {
	    this.setHalfMoveClock(0);	// Clear half move count (pawn was moved)
	    var delta = m.getTo() - m.getFrom();
	    if (delta == 2) {
		this.ep = (m.getFrom() >> 3) + 1;
		this.side_white.setEPFile(m.getFrom() >> 3);
	    } else if (delta == -2) {
		this.ep = (m.getFrom() >> 3) + 1;
		this.side_black.setEPFile(m.getFrom() >> 3);
	    }
	} else {
	    this.ep = 0;
	    if((this.board[m.getTo()] & 7) == C.PAWN) {
		this.setHalfMoveClock(0);	// Clear half move count (pawn was moved)
	    } else {
		this.incrementHalfMoveClock();
	    }
	}
	//
	// Record which piece is captured by the move we are executing (for undo operations)
	//
	m.setCapturedPiece(this.board[m.getTo()]);
	//
	// Fill in move destination square: either piece doing the move or the
	// promoted piece (in case of pawn promotion)
	//
	// Note: for now just assume that pawns always promote to queens. The possible other
	// promotions are part of the list of legal moves already, but we need an additional
	// logic to detect the promotion and prompt the user to which piece to promote to. For
	// now we take the first promotion in the list (which happens to be a queen promotion)
	//
	if(m.getPromotedTo() == C.EMPTY) {
	    this.board[m.getTo()] = this.board[m.getFrom()];
	} else {
	    this.board[m.getTo()] = m.getPromotedTo();
	}
	//
	// Clear source square
	//
	this.board[m.getFrom()] = C.EMPTY;
	//
	// Keep track of squares that need updating in the interface
	//
	changed_squares.push(m.getTo());
	changed_squares.push(m.getFrom());
	//
	// Handle regular moves, en passant captures and castling different
	//
	if(m.getEP()) {
	    if(this.side2move == C.WHITE) {
		m.setCapturedPiece(this.board[m.getTo() - 1]);
		this.board[m.getTo() - 1] = C.EMPTY;
		changed_squares.push(m.getTo() - 1);
	    } else {
		m.setCapturedPiece(this.board[m.getTo() + 1]);
		this.board[m.getTo() + 1] = C.EMPTY;
		changed_squares.push(m.getTo() + 1);
	    }
	} else if(m.getCastling() == C.SHORT_CASTLING) {
	    this.board[m.getFrom() + 8] = this.board[m.getTo() + 8];
	    this.board[m.getTo() + 8] = C.EMPTY;
	    changed_squares.push(m.getFrom() + 8);
	    changed_squares.push(m.getTo() + 8);
	} else if(m.getCastling() == C.LONG_CASTLING) {
	    this.board[m.getFrom() - 8] = this.board[m.getTo() - 16];
	    this.board[m.getTo() - 16] = C.EMPTY;
	    changed_squares.push(m.getFrom() - 8);
	    changed_squares.push(m.getTo() - 16);
	}
	//
	// Update which color to make next move
	//
	if(this.side2move == C.WHITE) {
	    this.side2move = C.BLACK;
	} else {
	    this.side2move = C.WHITE;
	    this.incrementMoveNumber();
	}
	//
	// Adjust castling option flags. Logic is to remove castling
	// options when a king or rook is played or captured.
	//
	if((m.getFrom() == C.POS_E1) || (m.getTo() == C.POS_E1)){
	    this.setOO(C.WHITE, false);
	    this.setOOO(C.WHITE, false);
	} else if((m.getFrom() == C.POS_H1) || (m.getTo() == C.POS_H1)) {
	    this.setOO(C.WHITE, false);
	} else if((m.getFrom() == C.POS_A1) || (m.getTo() == C.POS_A1)) {
	    this.setOOO(C.WHITE, false);
	} else if((m.getFrom() == C.POS_E8) || (m.getTo() == C.POS_E8)){
	    this.setOO(C.BLACK, false);
	    this.setOOO(C.BLACK, false);
	} else if((m.getFrom() == C.POS_H8) || (m.getTo() == C.POS_H8)) {
	    this.setOO(C.BLACK, false);
	} else if((m.getFrom() == C.POS_A8) || (m.getTo() == C.POS_A8)) {
	    this.setOOO(C.BLACK, false);
	}
        //
	// Generate new legal move list
	//
	this.movelist = this.dynamo.generateMoveList(this.side2move, this);
        //
        // Update hash for board position: could be done a lot more
        // efficient (Zobrist hashes can be computed incrementally) but works for now
        //
        this.key = compute_fen_hash(this.toFENString());
	//
	// Return list of squares that have been modified by executing the move:
	// allows for efficient screen redraws (instead of having to rebuild the
	// the entire board after each move)
	//
	return changed_squares;
    }
    //
    // Reverse a move on the current board.
    //
    undoMove(m) {
	//
	// List to receive squares that have changed contents
	// and need to be redrawn
	//
	var changed_squares = new Array();
	//
	// Undo piece movements
	//
	if(m.isEP) {
	    this.board[m.getFrom()] = this.board[m.getTo()]
	    this.board[m.getTo()] = C.EMPTY;
	    changed_squares.push(m.getFrom());
	    changed_squares.push(m.getTo());
	    if(m.getFrom() < m.getTo()) {
		this.board[m.getFrom() + 8] = m.piece_captured;
		changed_squares.push(m.getFrom() + 8);
	    } else {
		this.board[m.getFrom() - 8] = m.piece_captured;
		changed_squares.push(m.getFrom() - 8);
	    }
	} else if(m.promotedTo != C.EMPTY) {
	    this.board[m.getFrom()] = (this.board[m.getTo()] & C.COLORMASK) |
		C.PAWN;
	    this.board[m.getTo()] = m.piece_captured;
	    changed_squares.push(m.getFrom());
	    changed_squares.push(m.getTo());
	} else if(m.castling == C.SHORT_CASTLING) {
	    //
	    // Undo king move
	    //
	    this.board[m.getFrom()] = this.board[m.getTo()]
	    this.board[m.getTo()] = C.EMPTY;
	    changed_squares.push(m.getFrom());
	    changed_squares.push(m.getTo());
	    //
	    // Undo rook move
	    //
	    this.board[m.getTo() + 8] = this.board[m.getFrom() + 8];
	    this.board[m.getFrom() + 8] = C.EMPTY;
	    changed_squares.push(m.getFrom() + 8);
	    changed_squares.push(m.getTo() + 8);
	} else if(m.castling == C.LONG_CASTLING) {
	    //
	    // Undo king move
	    //
	    this.board[m.getFrom()] = this.board[m.getTo()]
	    this.board[m.getTo()] = C.EMPTY;
	    changed_squares.push(m.getFrom());
	    changed_squares.push(m.getTo());
	    //
	    // Undo rook move
	    //
	    this.board[m.getTo() - 16] = this.board[m.getFrom() - 8];
	    this.board[m.getFrom() - 8] = C.EMPTY;
	    changed_squares.push(m.getFrom() - 8);
	    changed_squares.push(m.getTo() - 16);
	} else {
	    //
	    // "Regular" move
	    //
	    this.board[m.getFrom()] = this.board[m.getTo()]
	    this.board[m.getTo()] = m.piece_captured;
	    changed_squares.push(m.getFrom());
	    changed_squares.push(m.getTo());
	}
	//
	// Undo various property changes of Board
	//
	m.undoBoard(this);
        //
        // Update hash for board position: could be done a lot more
        // efficient (Zobrist hashes can be computed incrementally) but works for now
        //
        this.key = compute_fen_hash(this.toFENString());
        //
	// Generate new legal move list
	//
	this.movelist = this.dynamo.generateMoveList(this.side2move, this);
	//
	// Return list of squares that have been modified by executing the move:
	// allows for efficient screen redraws (instead of having to rebuild the
	// the entire board after each move)
	//
	return changed_squares;
    }

    cell(k) {
	return this.board[k];
    }

    cellByRC(r, c) {
	return this.cell(this.rc2i(r, c));
    }
    dumpMoveList() {
	console.log("*** Movelist:");
	for(var i = 0; i < this.movelist.length; ++i) {
	    console.log("" + i + ": " + this.movelist[i].toString());
	}
    }
    generateMoveList() {
        var dynamo = new CBFMoveGenerator();
        return dynamo.generateMoveList(this.getSideToMove(), this);
    }
    //
    // Returns array of BookEntry objects
    //
    // Convert BookEntry objects to Move objects using the "to_move()" method
    // on BookEntry objects
    //
    getBookMoves(da_book) {
        var lst = da_book.get_all_moves(this.key);
        return lst;
    }

}
//////////////////////////////////////////////////
//
// Move generator stuff
//
//////////////////////////////////////////////////

class CBFMoveGenerator {
    constructor() {
    }

    //
    // Debugging aid
    //
    doLog(verbose, s) {
	if(verbose) {
	    console.log(s);
	}
    }
    //
    // "color" is either C.WHITE or C.BLACK
    // "board" is an instance of class "Board"
    //
    generateMoveList(color, board) {
	var v = new Array();
	for(var i = 0; i < 64; ++i) {
            //
            // Note that the weird looking bit operations will select only
            // cells containing a piece of the selected color (empty cells
            // will also fail the test)
            //
            switch((board.board[i] & C.MASK) ^ color) {
            case C.KING:
                this.moveKing(board.board, i, board.board[i] & C.COLORMASK, v);
                break;
            case C.QUEEN:
                this.moveQueen(board.board, i, board.board[i] & C.COLORMASK, v);
                break;
            case C.BISHOP:
                this.moveBishop(board.board, i, board.board[i] & C.COLORMASK, v);
                break;
            case C.KNIGHT:
                this.moveKnight(board.board, i, board.board[i] & C.COLORMASK, v);
                break;
            case C.ROOK:
                this.moveRook(board.board, i, board.board[i] & C.COLORMASK, v);
                break;
            case C.PAWN:
                this.movePawn(board.board, i, board.board[i] & C.COLORMASK, board.getEP(), v);
                break;
            default:
                //
                // NOP: skip cell (is either empty or of wrong color)
                //
                break;
            }
	}
	//
	// Fill in human readable form for each move
	//
	var moovz = {};
	for(var i = 0; i < v.length; ++i) {
	    var m = v[i];
	    if(m.isOO()) {
		m.text = "O-O";
	    } else if(m.isOOO()) {
		m.text = "O-O-O";
	    } else {
		//
		// Note: captured piece is only filled in when the move is actually
		// executed, so that info is not yet available at this point in time
		// (only generating the list of all legal moves in current position)
		//
		var simple = "";
		var pce = board.board[m.from] & C.PIECEMASK;
		var r = m.to % 8 + 1;
		var c = "abcdefgh".charAt(m.to / 8);
		if(pce != C.PAWN) {
		    //
		    // Not a pawn move and no castling
		    //
		    simple = C.FENPIECENAMES.charAt(pce - 1);
		    if(board.board[m.getTo()] != C.EMPTY) {
			simple += "x";
		    }
		    simple += c + r;
		} else {
		    //
		    // Pawn move
		    //
		    if(m.isEP) {
			//
			// En passant capture
			//
			simple = "abcdefgh".charAt(m.from / 8) + "x" + c + r + "e.p.";
		    } else if(m.promotedTo != C.EMPTY) {
			//
			// Pawn promotion
			//
			if(board.board[m.getTo()] != C.EMPTY) {
			    simple = ("abcdefgh".charAt(m.from / 8)) + "x";
			}
			simple += c + r + "=" +
			    C.FENPIECENAMES.charAt((m.promotedTo & C.PIECEMASK) - 1);
		    } else {
			//
			// Regular pawn move or capture
			//
			if(board.board[m.getTo()] != C.EMPTY) {
			    simple = "abcdefgh".charAt(m.to / 8) + "x";
			}
			simple += c + r;
		    }
		}
		m.text = simple;
		//
		// Known bug: for now only consider
		// max. 2 same pieces per color (so ignore case where
		// pawn promotions created situations with 3 or more of
		// the same piece for one color), but this tool is (for now)
		// intended for opening training, so not much chance of 3 queens...
		//
		if(!moovz[simple]) {
		    //
		    // No duplicates yet
		    //
		    moovz[simple] = m;
		} else {
		    //
		    // At least one duplicate
		    //
		    var r0 = moovz[simple].from % 8 + 1;
		    var c0 = "abcdefgh".charAt(moovz[simple].from / 8);
		    var r1 = m.from % 8 + 1;
		    var c1 = "abcdefgh".charAt(m.from / 8);
		    if(c1 != c0) {
			//
			// Use column to distinguish
			//
			moovz[simple].text = simple.charAt(0) + c0 +
			    simple.substr(1);
			m.text = simple.charAt(0) + c1 +
			    simple.substr(1);
		    } else {
			//
			// Use row to distinguish
			//
			moovz[simple].text = simple.charAt(0) + r0 +
			    simple.substr(1);
			m.text = simple.charAt(0) + r1 +
			    simple.substr(1);
		    }
		}
	    }
	}
	//
	// Now return the move list
	//
	return v;
    }
    //
    // Generate all possible king moves from specified location.
    //
    // @param brd <CODE>byte[]</CODE> containing the current piece setup
    // @param p <CODE>int</CODE> containing the start position
    // @param C <CODE>int</CODE> containing the color of the piece to move
    // @param v <CODE>Vector</CODE> to append the moves to
    //
    moveKing(brd, p, c, v) {
        //
        // Try usual suspects first (i.e. no castling)
        //
        this.movePiece(brd, p, c, -1, -1, false, v);
        this.movePiece(brd, p, c, 0, -1, false, v);
        this.movePiece(brd, p, c, 1, -1, false, v);
        this.movePiece(brd, p, c, -1, 0, false, v);
        this.movePiece(brd, p, c, 1, 0, false, v);
        this.movePiece(brd, p, c, -1, 1, false, v);
        this.movePiece(brd, p, c, 0, 1, false, v);
        this.movePiece(brd, p, c, 1, 1, false, v);
        //
        // Now try castling
        //
        if (((c == C.WHITE) && (p == C.POS_E1)) ||
            ((c == C.BLACK) && (p == C.POS_E8))) {
            //
            // Try O-O
            //
            var to = p + 16;
            if ((brd[p + 24] == (C.ROOK | c)) &&
                (brd[p + 8] == C.EMPTY) && (brd[to] == C.EMPTY)) {
                //
                // Note: what about other checks that would make castling
                // illegal??? (checks, or one of the pieces has already moved)
                //
                this.addMove(p, to, C.EMPTY, C.SHORT_CASTLING, false, v);
            }
            //
            // Try O-O-O
            //
            to = p - 16;
            if ((brd[p - 32] == (C.ROOK | c)) &&
                (brd[p - 8] == C.EMPTY) && (brd[to] == C.EMPTY) &&
                (brd[p - 24] == C.EMPTY)) {
                //
                // Note: what about other checks that would make castling
                // illegal??? (checks, or one of the pieces has already moved)
                //
                this.addMove(p, to, C.EMPTY, C.LONG_CASTLING, false, v);
            }
        }
    }
    //
    // Generate all possible queen moves from specified location.
    //
    // @param brd <CODE>byte[]</CODE> containing the current piece setup
    // @param p <CODE>int</CODE> containing the start position
    // @param C <CODE>int</CODE> containing the color of the piece to move
    // @param v <CODE>Vector</CODE> to append the moves to
    //
    moveQueen(brd, p, c, v) {
        this.movePiece(brd, p, c, -1, -1, true, v);
        this.movePiece(brd, p, c, -1, 1, true, v);
        this.movePiece(brd, p, c, 1, 1, true, v);
        this.movePiece(brd, p, c, 1, -1, true, v);
        this.movePiece(brd, p, c, 0, -1, true, v);
        this.movePiece(brd, p, c, -1, 0, true, v);
        this.movePiece(brd, p, c, 0, 1, true, v);
        this.movePiece(brd, p, c, 1, 0, true, v);
    }
    //
    // Generate all possible bishop moves from specified location.
    //
    // @param brd <CODE>byte[]</CODE> containing the current piece setup
    // @param p <CODE>int</CODE> containing the start position
    // @param C <CODE>int</CODE> containing the color of the piece to move
    // @param v <CODE>Vector</CODE> to append the moves to
    //
    moveBishop(brd, p, c, v) {
        this.movePiece(brd, p, c, -1, -1, true, v);
        this.movePiece(brd, p, c, -1, 1, true, v);
        this.movePiece(brd, p, c, 1, 1, true, v);
        this.movePiece(brd, p, c, 1, -1, true, v);
    }
    //
    // Generate all possible knight moves from specified location.
    //
    // @param brd <CODE>byte[]</CODE> containing the current piece setup
    // @param p <CODE>int</CODE> containing the start position
    // @param C <CODE>int</CODE> containing the color of the piece to move
    // @param v <CODE>Vector</CODE> to append the moves to
    //
    moveKnight(brd, p, c, v) {
        this.movePiece(brd, p, c, -1, -2, false, v);
        this.movePiece(brd, p, c, 1, -2, false, v);
        this.movePiece(brd, p, c, -1, 2, false, v);
        this.movePiece(brd, p, c, 1, 2, false, v);
        this.movePiece(brd, p, c, -2, -1, false, v);
        this.movePiece(brd, p, c, 2, -1, false, v);
        this.movePiece(brd, p, c, -2, 1, false, v);
        this.movePiece(brd, p, c, 2, 1, false, v);
    }
    //
    // Generate all possible rook moves from specified location.
    //
    // @param brd <CODE>byte[]</CODE> containing the current piece setup
    // @param p <CODE>int</CODE> containing the start position
    // @param C <CODE>int</CODE> containing the color of the piece to move
    // @param v <CODE>Vector</CODE> to append the moves to
    //
    moveRook(brd, p, c, v) {
        this.movePiece(brd, p, c, 0, -1, true, v);
        this.movePiece(brd, p, c, -1, 0, true, v);
        this.movePiece(brd, p, c, 0, 1, true, v);
        this.movePiece(brd, p, c, 1, 0, true, v);
    }
    //
    // Generate all possible pawn moves from specified location.
    //
    // @param brd <CODE>byte[]</CODE> containing the current piece setup
    // @param p <CODE>int</CODE> containing the start position
    // @param c <CODE>int</CODE> containing the color of the piece to move
    // @param ep <CODE>int</CODE> value used for detecting en-passants
    // @param v <CODE>Vector</CODE> to append the moves to
    //
    movePawn(brd, p, c, ep, v) {
	var dir;    // Normal increment for pawn advance
	var pl;     // Departure line for pawns (are double pass advance)
	var dp;     // Destination for double-move

        if (c == C.WHITE) {
            dir = 1;
            pl = 1;
        } else {
            dir = -1;
            pl = 6;
        }
	var to = p + dir;
        //
        // Try normal advance first
        //
        if (brd[to] == C.EMPTY) {
            dp = to + dir;  // Try double-move first
            if (((p & 7) == pl) && (brd[dp] == C.EMPTY)) {
                this.addMove(p, dp, C.EMPTY, C.NO_CASTLING, false, v);
            }
            if ((to & 7) == 7 - pl + dir) {
                //
                // Advance is a pawn promotion
                //
                this.doPromotion(p, to, v);
            } else {
                //
                // Normal single pass advance
                //
                this.addMove(p, to, C.EMPTY, C.NO_CASTLING, false, v);
            }
        }
        //
        // Try capturing in direction of the A-file
        //
        to = p - 8 + dir;
        if ((to >= 0) && ((brd[to] ^ c) > 8)) {
            //
            // Destination is on board and contains a piece of the
            // opposite color
            //
            if ((to & 7) == 7 - pl + dir ) {
                //
                // Capture is a pawn promotion
                //
                this.doPromotion(p, to, v);
            } else {
                //
                // Capture is not a pawn promotion
                //
                this.addMove(p, to, C.EMPTY, C.NO_CASTLING, false, v);
            }
        }
        //
        // Try capturing in direction of the H-file
        //
        to = p + 8 + dir;
        if ((to < 64) && ((brd[to] ^ c) > 8)) {
            //
            // Destination is on board and contains a piece of the
            // opposite color
            //
            if ((to & 7) == 7 - pl + dir ) {
                //
                // Capture is a pawn promotion
                //
                this.doPromotion(p, to, v);
            } else {
                //
                // Capture is not a pawn promotion
                //
                this.addMove(p, to, C.EMPTY, C.NO_CASTLING, false, v);
            }
        }
        //
        // Try en-passant capture
        //
        if ((ep != 0) && ((p & 7) == pl + 3 * dir)) {
	    var h = ((p >> 3) & 7) - ep;
            if (h == 0) {
                this.addMove(p, p - 8 + dir, C.EMPTY, C.NO_CASTLING, true, v);
            } else if (h == -2) {
                this.addMove(p, p + 8 + dir, C.EMPTY, C.NO_CASTLING, true, v);
            }
        }
    }
    //
    // Check if square is empty.
    //
    // @param brd <CODE>byte[]</CODE> containing the current piece setup
    // @param o <CODE>int</CODE> containing the square index on the board
    // to check
    // @return <CODE>boolean</CODE> value <CODE>true</CODE> if the
    // specified cell is empty.
    //
    isEmpty(brd, o) {
        return (brd[o] == C.EMPTY);
    }
    //
    // Check if a position is still on the board.
    //
    // @param p <CODE>int</CODE> containing the start position
    // @param dy <CODE>int</CODE> containing the vertical displacement
    // @param dx <CODE>int</CODE> containing the horizontal displacement
    // @return <CODE>boolean</CODE> value <CODE>true</CODE> if the specified
    // location is still on the board.
    //
    isOnBoard(p, dy, dx) {
        //return ((((p % 8) + dy) & 0xfffffff8) == 0) &&
        //((((p >> 3) + dx) & 0xfffffff8) == 0);
	var r = (p >> 3) + dx;
	var c = (p % 8) + dy;
	//return ((((p % 8) + dy) < 0 ) || (((p % 8) + dy) > 7 )) &&
	//((((p >> 3) + dx) < 0 ) || (((p << 3) + dx) > 7 ));
	return (r >= 0) && (r < 8) && (c >= 0) && (c < 8);
    }
    //
    // Move a piece in the given direction and append new moves to the list.
    // <p>
    // If <CODE>multi</CODE> is <CODE>true</CODE>, the attempts continue
    // until end-of-board or another piece is encountered. If that piece is
    // of opposite color, the square occupied by that piece is added to the
    // move list.
    // <p>
    // This method is used for the horizontal, vertical and diagonal movements
    // of the various pieces.
    //
    // @param brd <CODE>byte[]</CODE> containing the current piece setup
    // @param p <CODE>int</CODE> containing the position of the piece to
    // move
    // @param C <CODE>int</CODE> containing the color of the piece to move
    // @param dy <CODE>int</CODE> containint the delta-Y (vertical
    // increment) per attempted
    // move
    // @param dx <CODE>int</CODE> containint the delta-X (horizontal
    // increment) per attempted
    // move
    // @param multi <CODE>boolean</CODE> indicating if the attempted
    // moves have to be repeated for as long as possible.
    // @param v <CODE>Vector</CODE> to append the moves to
    //
    movePiece(brd, p, c, dy, dx, multi, v) {
	var verbose = ((brd[p] & 7) == C.KNIGHT);
	var delta = (dx * 8) + dy;
        var to = p;

        if (!this.isOnBoard(p, dy, dx)) {
            return;
        }
        while (this.isOnBoard(to, dy, dx)) {
            to += delta;
            if (brd[to] == C.EMPTY) {
                //
                // Empty square.
                //
                this.addMove(p, to, C.EMPTY, C.NO_CASTLING, false, v);
            } else if ((brd[to] ^ c) > 8) {
                //
                // Piece of opposite color
                //
                this.addMove(p, to, C.EMPTY, C.NO_CASTLING, false, v);
                return;
            } else {
                //
                // Piece ofsame color
                //
                return;
            }
            if (!multi) {
                return;
            }
        }
    }
    //
    // Add all possible pawn promotions for given pawn advance.
    //
    // @param p <CODE>int</CODE> containing the start position of the pawn
    // @param to <CODE>int</CODE> containing the end position of the pawn
    // @param v <CODE>Vector</CODE> to append the moves to
    //
    doPromotion(p, to, v) {
        this.addMove(p, to, C.QUEEN, C.NO_CASTLING, false, v);
        this.addMove(p, to, C.ROOK, C.NO_CASTLING, false, v);
        this.addMove(p, to, C.BISHOP, C.NO_CASTLING, false, v);
        this.addMove(p, to, C.KNIGHT, C.NO_CASTLING, false, v);
    }
    //
    // Add a new move to the list.
    //
    // @param p <CODE>int</CODE> containing the start position
    // @param to <CODE>int</CODE> containing the end position
    // @param prom <CODE>int</CODE> containing the piece into which to
    // promote (for pawn promotions only)
    // @param castle <CODE>int</CODE> code for castling operations
    // @param v <CODE>Vector</CODE> containing the move list to append the
    // new move to
    //
    addMove(p, to, prom, castle, ep, v) {
        if ((p < 0) || (p >= 64) || (to < 0) || (to >= 64)) {
            return;
        }
        if (v.length >= C.MAX_LENGTH_MOVELIST) {
            //
            // Woah! This should never happen (according to the good people
            // at chessbase ;-)
            //
	    alert("Too many moves for list");
	    return;
        }
	var mv = new Move(p, to);
	mv.setPromotedTo(prom);
	mv.setCastling(castle);
	mv.setEP(ep);
        v.push(mv);
    }
}

