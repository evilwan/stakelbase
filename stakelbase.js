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
// General internal definitions for StakelBase. This
// file does not specify anything regarding the
// implementation of a user interface.
//
//////////////////////////////////////////////////


//////////////////////////////////////////////////
//
// Constants and utility methods used throughout the other classes.
//
// Items can be referred to by prefixing
// the names with "C." For example, C.KNIGHT will refer to the internal
// code used for a knight.
//
//////////////////////////////////////////////////

class StakelBaseConstants {
    constructor() {
        //
        // Color bitmasks: OR them with piece codes for
        // obtaining values as stored in the board matrix
        //
        this.WHITE = 0;
        this.BLACK = 0x08;
        this.MASK = 0x0f;
        this.PIECEMASK = 0x07;
        this.COLORMASK = 0x08;
        //
        // Codes for the different pieces as stored in the
        // board matrix
        //
        this.EMPTY = 0;
        this.KING = 1;
        this.QUEEN = 2;
        this.ROOK = 3;
        this.BISHOP = 4;
        this.KNIGHT = 5;
        this.PAWN = 6;
        this.INVALID = 7;
        //
        // Warning = order below must correspond to definitions above!
        // (keep same order)
        //
        this.FENPIECENAMES = "KQRBNP";
        //
        // FEN value for position at start of game
        //
        this.FEN_START = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
        //
        // Codes for all different pieces as used in the internal
        // board matrix
        //
        this.WHITE_KING = this.KING | this.WHITE;
        this.WHITE_QUEEN = this.QUEEN | this.WHITE;
        this.WHITE_ROOK = this.ROOK | this.WHITE;
        this.WHITE_BISHOP = this.BISHOP | this.WHITE;
        this.WHITE_KNIGHT = this.KNIGHT | this.WHITE;
        this.WHITE_PAWN = this.PAWN | this.WHITE;

        this.BLACK_KING = this.KING | this.BLACK;
        this.BLACK_QUEEN = this.QUEEN | this.BLACK;
        this.BLACK_ROOK = this.ROOK | this.BLACK;
        this.BLACK_BISHOP = this.BISHOP | this.BLACK;
        this.BLACK_KNIGHT = this.KNIGHT | this.BLACK;
        this.BLACK_PAWN = this.PAWN | this.BLACK;
        //
        // Stuff specific for old DB move generator
        //
        // Maximum number of moves allowed in list
        //
        this.MAX_LENGTH_MOVELIST = 127;
        //
        // No castling.
        //
        this.NO_CASTLING = 0;
        //
        // 0-0 code
        //
        this.SHORT_CASTLING = 1;
        //
        // 0-0-0 code
        //
        this.LONG_CASTLING = 2;
        //
        // Initial position both kings (E8 square) and rooks.
        // (used for checking castling flags)
        //
        this.POS_E1 = 32;
        this.POS_G1 = 48;
        this.POS_E8 = 39;
        this.POS_G8 = 55;
        this.POS_A1 = 0;
        this.POS_C1 = 16;
        this.POS_A8 = 7;
        this.POS_C8 = 23;
        this.POS_H1 = 56;
        this.POS_H8 = 63;
        //
        // Codes for all different pieces as used in the internal
        // board matrix
        //
        this.WHITE_KING = this.KING | this.WHITE;
        this.WHITE_QUEEN = this.QUEEN | this.WHITE;
        this.WHITE_ROOK = this.ROOK | this.WHITE;
        this.WHITE_BISHOP = this.BISHOP | this.WHITE;
        this.WHITE_KNIGHT = this.KNIGHT | this.WHITE;
        this.WHITE_PAWN = this.PAWN | this.WHITE;

        this.BLACK_KING = this.KING | this.BLACK;
        this.BLACK_QUEEN = this.QUEEN | this.BLACK;
        this.BLACK_ROOK = this.ROOK | this.BLACK;
        this.BLACK_BISHOP = this.BISHOP | this.BLACK;
        this.BLACK_KNIGHT = this.KNIGHT | this.BLACK;
        this.BLACK_PAWN = this.PAWN | this.BLACK;
    }
    //
    // Debugging aid = convert board subscript to conventional
    // square name
    //
    i2nam(k) {
	return ["a", "b", "c", "d", "e", "f", "g", "h"][k >> 3] + ((k & 7) + 1);
    }
}
var C = new StakelBaseConstants();
