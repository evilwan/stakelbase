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
// "Controller" part of the StakelBase implementation
//
// Note: make sure that both "sbboard.js" and "sbbase.js" are
// loaded before loading this file.
//
//////////////////////////////////////////////////

//
// View (display) related constants and utility methods
//
class ViewConstants {
    constructor() {
        //
        // Display related constants
        //
        // Default dimensions of chess board
        //
        // Background colors of the board squares
        //var LIGHT_SQUARE_COLOR = '#FFDEAD';
        //var DARK_SQUARE_COLOR = '#A52A2A';
        this.LIGHT_SQUARE_COLOR = '#FFDEAD';
        this.DARK_SQUARE_COLOR = '#A52A2A';
        //DARK_SQUARE_COLOR = '#A52A2A',
        this.DARK_SQUARE_COLOR = '#CD853F';
        this.CLICKED_SQUARE_COLOR = '#ADFF2F';
        //
        // Used for naming individual cells on the board.
        //
        this.CELL_NAME = "cell";
        //
        // Unicode values for chess figurines
        //
        this.CHAR_WHITE_KING = '\u2654';
        this.CHAR_WHITE_QUEEN = '\u2655';
        this.CHAR_WHITE_ROOK = '\u2656';
        this.CHAR_WHITE_BISHOP = '\u2657';
        this.CHAR_WHITE_KNIGHT = '\u2658';
        this.CHAR_WHITE_PAWN = '\u2659';

        this.CHAR_BLACK_KING = '\u265a';
        this.CHAR_BLACK_QUEEN = '\u265b';
        this.CHAR_BLACK_ROOK = '\u265c';
        this.CHAR_BLACK_BISHOP = '\u265d';
        this.CHAR_BLACK_KNIGHT = '\u265e';
        this.CHAR_BLACK_PAWN = '\u265f' ;
        //
        // Not really a unicode character but still usable in an HTML
        // table
        //
        this.CHAR_EMPTY_CELL = '&nbsp;';
        //
        // Indicator for who is to move
        //
        this.WHO2MOVE_POINTER = '\u27a4';
        //
        // Code to indicate that no cell was clicked
        //
        this.NO_CELL_CLICKED = -1;	// cell [0,0] is a valid cell, so can't initialize to zero
        //
        // Same unicode values as above but in handy accessible array = use (piece code - 1) for index
        //
        this.CHAR_WHITE_PIECES = [
	    '\u2654',
	    '\u2655',
	    '\u2656',
	    '\u2657',
	    '\u2658',
	    '\u2659'
        ];
        this.CHAR_BLACK_PIECES = [
	    '\u265a',
	    '\u265b',
	    '\u265c',
	    '\u265d',
	    '\u265e',
	    '\u265f'
        ];
    }
    //
    // Utility functions to return various dimensions based on current situation.
    //
    getBoardSize() {
	return ((stakelbase_html_element.clientWidth < stakelbase_html_element.clientHeight)?
		stakelbase_html_element.clientWidth: stakelbase_html_element.clientHeight)
    }
    getSquareSide() {
	return this.getBoardSize() / 10;
    }
    getFontSize() {
	//return this.getSquareSide() * 0.65;
	return this.getSquareSide() * 0.85;
        //return 5;
    }
    getCellStyle() {
    }
    text2pic(txt) {
	//
	// Replace English piece name by figurine unicode character
	//
	var ext = txt;
	var idx = C.FENPIECENAMES.indexOf(ext.charAt(0));
	if(idx >= 0) {
	    //
	    // First char is one of the uppercase FEN piece names (which coincide
	    // with the English name of the piece names)
	    //
	    ext = this.CHAR_WHITE_PIECES[idx] + ext.substr(1);
	}
	//
	// Check if last char is also a FEN piece name (indicates pawn promotion)
	//
	idx = C.FENPIECENAMES.indexOf(ext.charAt(ext.length - 1));
	if(idx >= 0) {
	    ext = ext.substring(0, ext.length - 1) + this.CHAR_WHITE_PIECES[idx];
	}
	return ext;
    }
}
var V = new ViewConstants();

//////////////////////////////////////////////////
//
// Display part of the code
//
//////////////////////////////////////////////////

//
// "the_board" is an instance of class "Board"
//
class DisplayBoard {
    constructor() {
        this.board = new Board();
        this.clicked_cell = V.NO_CELL_CLICKED;
        this.promotion_piece = C.EMPTY;
        this.move_r0 = 0;
        this.move_c0 = 0;
        this.move_r = 0;
        this.move_c = 0;
        this.plys = new Array;
        this.black_view = 0;	// 0=white board view, 1=black board view
    }

    //
    // (Re)initialize a dispay board
    //
    init() {
	this.board = new Board("");	// Board object
	this.clicked_cell = V.NO_CELL_CLICKED;
	this.promotion_piece = C.EMPTY;
	this.move_r0 = 0;
	this.move_r = 0;
	this.move_c = 0;
	this.move_c0 = 0;
	this.plys = new Array;
	this.black_view = 0;
    }
    is_white2move() {
	return !(this.plys.length % 2);
    }
    //
    // Board drawing related methods
    //
    // Convert (row, column) to board cell subscript
    //
    rc2i(r, c) {
	return (c << 3 | r);
    }
    //
    // Is this a light colored square?
    //
    islight(r, c) {
	return ((r + c) % 2);
    }
    //
    // Create a cell name to be used in HTML
    //
    cell2id(r, c) {
	return V.CELL_NAME + this.rc2i(r, c);
    }
    //
    // Convert board cell index back to row and column
    //
    i2col(i) {
	return (i >> 3);
    }

    i2row(i) {
	return (i & 7);
    }

    i2id(i) {
	return this.cell2id(this.i2row(i), this.i2col(i));
    }
    //
    // Refresh all 64 squares
    //
    refreshBoard() {
	for(var i = 0; i < 8; ++i) {
	    for(var j = 0; j < 8; ++j) {
		var thecell = document.getElementById(this.cell2id(i, j));
		thecell.innerHTML = this.cell2piece(this.board.cellByRC(i, j));
	    }
	}
    }
    //
    // Do a single move = both on internal board representation and in HTML page
    //
    // Difference with doSimpleMove() is that this version assumes a fully initialized
    // Move object as parameter.
    //
    doMove(mv) {
        var move_text = V.text2pic(mv.to_move(this.board));		// externalized move text
	var changed_squares = this.board.doMove(mv);	// Do move on internal board representation
	this.plys.push(mv);	// Store all (half) moves that we executed
	//
	// Reset work variables for handling promotion modal dialog
	//
	this.promotion_piece = C.EMPTY;
	this.move_r0 = 0;
	this.move_r = 0;
	this.move_c = 0;
	this.move_c0 = 0;
	//
	//  Now move piece(s) on screen as well
	//
	for(var j = 0; j < changed_squares.length; ++j) {
	    var row = this.i2row(changed_squares[j]);
	    var col = this.i2col(changed_squares[j]);
	    var thecell = document.getElementById(this.cell2id(row, col));
	    thecell.innerHTML = this.cell2piece(this.board.cell(changed_squares[j]));
	}
	//
	// Update side to move marker
	//
	this.mark_side2move();
        //
        // Refresh variations list
        //
        set_variations();
	//
	// Update moves notation list
	//
	var mvnr = (this.plys.length + 1) >> 1;
	//
	// Replace English piece name by figurine unicode character
	//
	var ext = V.text2pic(mv.text);
	if((this.plys.length % 2) == 0) {
	    //
	    // Black move = only fill in notation for black on last table row
	    //
	    var tr = notation_element.lastChild;
	    var td = tr.lastChild;
	    //td.innerHTML = "" + ext;
            td.innerHTML = "" + move_text;
	} else {
	    //
	    // White move = append whole new table row
	    //
	    var tr = document.createElement("tr");
	    var td = document.createElement("td");
            td.style.textAlign = "right";
	    td.innerHTML = "" + mvnr;
	    tr.appendChild(td);
	    td = document.createElement("td");
            td.style.textAlign = "right";
	    //td.innerHTML = "" + ext;
	    td.innerHTML = "" + move_text;
	    tr.appendChild(td);
	    td = document.createElement("td");
            td.style.textAlign = "right";
	    td.innerHTML = "...";
	    tr.appendChild(td);
	    //
	    // Append table row
	    //
	    notation_element.appendChild(tr);
	}
        //
        // Scroll to last line
        //
        var div = document.getElementById("notation_list");
        div.scrollTop = div.scrollHeight - div.clientHeight;

    }
    //
    // Do a single move = both on internal board representation and in HTML page
    //
    doSimpleMove(r0, c0, r, c) {
	//alert("Executing move = (" + r0 + ", " + c0 + ") - (" + r + ", " + c + ")");
	//
	// Quick'nd dirty approach = stuff piece from origin square into
        // destination square and clear origin square
	//
	var s0 = this.rc2i(r0, c0);
	var s1 = this.rc2i(r, c);
	if(s0 != s1) {
	    //
	    // Only do something when a piece was moved from one square to
            // another = do nothing if source and destination squares are the same.
	    //
	    var mv;
	    if((mv = this.board.isValidMove(s0, s1)) != null) {
		if(mv.promotedTo != C.EMPTY) {
		    //
		    // Pawn promotion move
		    //
		    if(this.promotion_piece == C.EMPTY) {
			//
			// No promotion piece selected yet
			//
			this.move_r0 = r0;
			this.move_r = r;
			this.move_c = c;
			this.move_c0 = c0;
			show_promotions();
			return;
		    }
		    //
		    // Selected a promotion piece: stuff in move object (note that
                    // the list of generated valid moves does not store the color info
                    // of the promoted piece)
		    //
		    mv = this.board.findValidMove(s0, s1, this.promotion_piece);
		    //
		    // Force correct color for promoted piece
		    //
		    var pce = mv.getPromotedTo();
		    if(this.plys.length % 2) {
			pce = (pce & C.PIECEMASK) | C.BLACK;
		    } else {
			pce = (pce & C.PIECEMASK) | C.WHITE;
		    }
		    mv.setPromotedTo(pce);
		}
		this.doMove(mv);	// Do move on internal board representation
	    }
	}
    }
    //
    // Undo last move.
    //
    undoSimpleMove() {
	var mv = this.plys.pop();
	var changed_squares = this.board.undoMove(mv);	// Do move on internal board representation
	//
	//  Now move piece(s) on screen as well
	//
	for(var j = 0; j < changed_squares.length; ++j) {
	    var row = this.i2row(changed_squares[j]);
	    var col = this.i2col(changed_squares[j]);
	    var thecell = document.getElementById(this.cell2id(row, col));
	    thecell.innerHTML = this.cell2piece(this.board.cell(changed_squares[j]));
	}
        //
        // Refresh variations list
        //
        set_variations();
	//
	// Update moves notation list
	//
	var tr = notation_element.lastChild;
	var mvnr = this.plys.length >> 1;
	if((this.plys.length % 2) == 0) {
	    //
	    // Undo white move = remove entire table row
	    //
	    notation_element.removeChild(tr);
	} else {
	    //
	    // Undo black move = only clear notation for black on last table row
	    //
	    var td = tr.lastChild;
	    td.innerHTML = "...";
	}
    }
    //
    // Callback function attached to cell click events in HTML
    //
    cell_clicked(r, c) {
	var cell = document.getElementById(this.cell2id(r, c));
	if(this.clicked_cell == V.NO_CELL_CLICKED) {
	    //
	    // No previous cell clicked
	    //
	    if(!this.board.isEmptyCell(this.rc2i(r, c))) {
		//
		// Ignore clicks on empty squares if nothing previously selected
		//
		this.clicked_cell = this.rc2i(r, c);
		cell.style.backgroundColor = V.CLICKED_SQUARE_COLOR;
	    }
	} else {
	    //
	    // A previous square, holding a piece, was selected
	    //
	    var fromcell = document.getElementById(this.i2id(this.clicked_cell));
	    var r0 = this.i2row(this.clicked_cell);
	    var c0 = this.i2col(this.clicked_cell);
	    //
	    // Unhighlight the previously selected square (regardless where user clicked now) and mark
	    // nothing selected = doSimpleMove will take care of case where source and destination square are
	    // the same (and in fact a NO-OP)
	    //
	    fromcell.style.backgroundColor = this.islight(r0, c0) ? V.LIGHT_SQUARE_COLOR: V.DARK_SQUARE_COLOR;
	    this.clicked_cell = V.NO_CELL_CLICKED;
	    this.doSimpleMove(r0, c0, r, c);
	}
    }

    //
    // Input is contents (code) of one cell
    //
    cell2piece(c) {
	//return "[cell2piece() c = " + c + "]";
	if(c == C.EMPTY) {
	    return V.CHAR_EMPTY_CELL;
	} else if(!this.board.isWhitePiece(c)) {
	    return V.CHAR_BLACK_PIECES[(c ^ C.BLACK) - 1];
	} else {
	    return V.CHAR_WHITE_PIECES[c - 1];
	}
    }
    //
    // Show board from white point of view
    //
    print_html_board_white_view(board_name) {
	var html = '';
	var stdatrs = ' align="center" valign="middle" style="font-size:' + V.getFontSize() + 'px; height:' +
	    V.getSquareSide() + 'px; width:' + V.getSquareSide() + 'px;"';
	html += '<table width="' + V.getBoardSize() + 'px" height="' + V.getBoardSize() + 'px" cellspacing="0" cellpadding="0" style="position:absolute; top:0; left:0">';
	html += '<tbody id="chessboard_tbody">';
	//
	// Top row = names of vertical files
	//
	html += '<tr valign="bottom" align="center"><td style="width:' + V.getSquareSide() + 'px;">&nbsp;</td><td>a</td><td>b</td><td>c</td><td>d</td><td>e</td><td>f</td><td>g</td><td>h</td><td>&nbsp;</td></tr>';
	var i;
        var j;
	//
	// Black pieces start out on row 7
	//
	for(i = 7; i >= 0; --i) {
	    if(i == 0) {
		html = html + "<tr height=\"" + V.getSquareSide() + "px\"><td id=\"id_white2move\" align=\"right\">" + (i + 1) + "</td>";
	    } else if(i == 7) {
		html = html + "<tr height=\"" + V.getSquareSide() + "px\"><td id=\"id_black2move\" align=\"right\">" + (i + 1) + "</td>";
	    } else {
		html = html + "<tr height=\"" + V.getSquareSide() + "px\"><td align=\"right\">" + (i + 1) + "</td>";
	    }
	    //
	    // A-file is column 0
	    //
	    for(j = 0; j < 8; ++j) {
		html += '<td name="' + V.CELL_NAME + '" id="' + this.cell2id(i, j) + '"';
		html += stdatrs;	// mainly sizing attributes
		if(this.islight(i, j)) {
		    html += ' bgcolor="' + V.LIGHT_SQUARE_COLOR + '"';
		} else {
		    html += ' bgcolor="' + V.DARK_SQUARE_COLOR + '"';
		}
		//html += ' onclick="javascript:' + boardname + '.cell_clicked(' + i + ', ' + j + ')">';
		//html += '><div style="width:' + V.getSquareSide() + 'px; height:' + V.getSquareSide() + 'px; font-size:' + V.getFontSize() + 'px;">';
		//html += '><div style="font-size:' + V.getFontSize() + 'px;">';
		html += '>';
		html += this.cell2piece(this.board.cellByRC(i, j));
		html = html + "</div></td>\n";
	    }
	    html = html + "<td>" + (i + 1) + "</td></tr>\n";
	}
	//
	// Bottom row = names of vertical files
	//
	html += '<tr valign="top" align="center"><td>&nbsp;</td><td>a</td><td>b</td><td>c</td><td>d</td><td>d</td><td>f</td><td>g</td><td>h</td><td>&nbsp;</td></tr>';
	html += '</tbody></table>';
	return html;
    }
    //
    // Show board from black point of view
    //
    print_html_board_black_view(board_name) {
	var html = '';
	var stdatrs = ' align="center" valign="middle" style="font-size:' + V.getFontSize() + 'px; height:' +
	    V.getSquareSide() + 'px; width:' + V.getSquareSide() + 'px;"';
	html += '<table width="' + V.getBoardSize() + 'px" height="' + V.getBoardSize() + 'px" cellspacing="0" cellpadding="0 style="position:absolute; top:0; left:0"">';
	html += '<tbody id="chessboard_tbody">';
	//
	// Top row = names of vertical files
	//
	html += '<tr valign="bottom" align="center"><td style="width:' + V.getSquareSide() + 'px;">&nbsp;</td><td>h</td><td>g</td><td>f</td><td>e</td><td>d</td><td>c</td><td>b</td><td>a</td><td>&nbsp;</td></tr>';
	var i; i;
	//
	// Black pieces start out on row 7
	//
	for(i = 0; i < 8; ++i) {
	    if(i == 0) {
		html = html + "<tr height=\"" + V.getSquareSide() + "px\"><td id=\"id_white2move\" align=\"right\">" + (i + 1) + "</td>";
	    } else if(i == 7) {
		html = html + "<tr height=\"" + V.getSquareSide() + "px\"><td id=\"id_black2move\" align=\"right\">" + (i + 1) + "</td>";
	    } else {
		html = html + "<tr height=\"" + V.getSquareSide() + "px\"><td align=\"right\">" + (i + 1) + "</td>";
	    }
	    //
	    // A-file is column 0
	    //
	    for(j = 7; j >= 0; --j) {
		html += '<td name="' + V.CELL_NAME + '" id="' + this.cell2id(i, j) + '"';
		html += stdatrs;	// mainly sizing attributes
		if(this.islight(i, j)) {
		    html += ' bgcolor="' + V.LIGHT_SQUARE_COLOR + '"';
		} else {
		    html += ' bgcolor="' + V.DARK_SQUARE_COLOR + '"';
		}
		//html += ' onclick="javascript:' + boardname + '.cell_clicked(' + i + ', ' + j + ')">';
		html += '>';
		html += this.cell2piece(this.board.cellByRC(i, j));
		html = html + "</td>\n";
	    }
	    html = html + "<td>" + (i + 1) + "</td></tr>\n";
	}
	//
	// Bottom row = names of vertical files
	//
	html += '<tr valign="top" align="center"><td>&nbsp;</td><td>h</td><td>g</td><td>f</td><td>e</td><td>d</td><td>c</td><td>b</td><td>a</td><td>&nbsp;</td></tr>';
	html += '</tbody></table>';
	return html;
    }
    //
    // Print current board contents to HTML, including necessary attributes such as event handlers
    // that will handle the UI part of the application (meaning executing the moves that the user
    // enters by clicking around)
    //
    // Output is HTML, nothting is printed to the HTML document directly.
    //
    print_html_board(boardname) {
	//
	// Easiest is to simply use two different methods for two different board orientations
	//
	if(this.black_view) {
	    return this.print_html_board_black_view(boardname);
	} else {
	    return this.print_html_board_white_view(boardname);
	}
    }
    //
    // Returns an array of Move objects
    //
    get_variations_list() {
        var lst = this.board.getBookMoves(da_book);
        var moveslist = new Array;
        if(lst !== undefined) {
            for(var i = 0; i < lst.length; ++i) {
                var mv = lst[i].to_move();
                mv.setWeight(lst[i].get_weight());
                moveslist.push(mv);
            }
        }
        return moveslist;
    }
    print_variations_html() {
        var html = "";
        var lst = this.get_variations_list();
        for(var i = 0; i < lst.length; ++i) {
            // html += "<option>" + lst[i].to_move(this.board) + " -- " + lst[i].getWeight() +
            //     "</option>\n";
            html += "<option>" + lst[i].to_move(this.board) + "</option>\n";
        }
        return html;
    }
    //
    // Show indicator on which side is to move
    //
    mark_side2move() {
	if(this.is_white2move()) {
	    document.getElementById("id_white2move").innerHTML =
		"<table><tr align=\"right\" valign=\"center\"><td valign=\"center\" style=\"font-size:" +
		V.getFontSize() + ";\">" + V.WHO2MOVE_POINTER + "</td><td valign=\"center\">1</td></tr></table>";
	    document.getElementById("id_black2move").innerHTML = "8";
	} else {
	    document.getElementById("id_white2move").innerHTML = "1";
	    document.getElementById("id_black2move").innerHTML =
		"<table><tr align=\"right\" valign=\"center\"><td valign=\"center\" style=\"font-size:" +
		V.getFontSize() + ";\">" + V.WHO2MOVE_POINTER + "</td><td valign=\"center\">8</td></tr></table>";
	}
    }
}
//
// Button click event handlers
//
function evt_clicked_start() {
    while(display_board.plys.length > 0) {
        display_board.undoSimpleMove();
    }
}
function evt_clicked_prv() {
    if(display_board.plys.length > 0) {
        display_board.undoSimpleMove();
    }
}
function evt_clicked_nxt() {
    var mvz = display_board.get_variations_list();
    if(mvz && (mvz.length == 1)) {
        //
        // Got exactly one possible continuation
        //
        var mv = mvz[0];
        display_board.doMove(mv);
    }
}
function evt_clicked_end() {
    var mvz = display_board.get_variations_list();
    while(mvz && (mvz.length == 1)) {
        //
        // Got exactly one possible continuation
        //
        var mv = mvz[0];
        display_board.doMove(mv);
        mvz = display_board.get_variations_list();
    }
}
function evt_open_book() {
    var fld = document.getElementById("open_file");
    let f = fld.files[0];
    let reader = new FileReader();
    reader.readAsBinaryString(f);
    reader.onload = function() {
        book_data = reader.result;
        da_book = new Book(book_data);
        reset_board();
    };
    reader.onerror = function() {
        console.log("~~~ evt_open_book() -- *ERROR* " + reader.error);
    };
}

function evt_clicked_rotate() {
    //
    // Switch board orientation
    //
    display_board.black_view = (display_board.black_view + 1) % 2;
    //
    // Redraw board
    //
    stakelbase_html_element.innerHTML = display_board.print_html_board("display_board");
    display_board.mark_side2move();
    add_cell_handlers();
}



function evt_variation_selected() {
    fld = document.getElementById("opts_selection");
    val = fld.value;
    idx = fld.selectedIndex;
    if(idx >= 0) {
        var lst = display_board.get_variations_list();
        display_board.doMove(lst[idx]);
    }
}
//////////////////////////////////////////////////
//
// onload handler to define event handlers for all 64 squares.
//
// This workaround is required to satisfy the Chrome model.
//
//////////////////////////////////////////////////

//
// Global variables
//
var training;	// Underlying model for training instance
//var internal_board;	// Board object
var display_board;	// DisplayBoard object
var stakelbase_html_element;	// HTML element with id="stakelbase"
var variation_element;
var variations_list;
var notation_element;
var da_book = null;
//
// (Re)set everything
//
function reset_board() {
    display_board = new DisplayBoard();
    stakelbase_html_element.innerHTML = display_board.print_html_board("display_board");
    notation_element.innerHTML = '<tr><th width="20%" style="text-align: right;">Nr.</th><th width="40%" style="text-align: right;">White</th><th width="40%" style="text-align: right;">Black</th></tr>';
    set_variations();
}
//
// Create board and show initial position
//
function create_board() {
    //
    // Global vars must be initialized before starting to write anything
    // to the interface
    //
    da_book = new Book(book_data);
    //training = new Training();
    //internal_board = new Board("");
    display_board = new DisplayBoard();
    stakelbase_html_element = document.getElementById("stakelbase");
    variation_element = document.getElementById("opts_selection");
    notation_element = document.getElementById("sb_notation");
    //
    // Ok, go!
    //
    stakelbase_html_element.innerHTML = display_board.print_html_board("display_board");
    set_variations();
    //onload_handler();
}
//
// Check which of the special attributes is specified for this element
// and assign necessary eventhandlers accordingly.
//
//
function process_html_element(elm) {
    var nb_atr;
    //
    // Note that "elm" does not have to be an HTML element, so check first
    // if "elm" does indeed have the "getAttribute()" accessor method.
    //
    if(elm.getAttribute) {
	//
	// Check for "onclick" handlers...
	//
	nb_atr = elm.getAttribute("sb_click");
	if(nb_atr) {
	    //
	    // "nb_atr" is a String containing the name of the evenhandler function:
	    // just use that string as a hash key in the "window" object (default
	    // context) to retrieve a pointer the the named function.
	    //
	    elm.onclick = window[nb_atr];
	}
	//
	// Check for "onchange" handlers...
	//
	nb_atr = elm.getAttribute("sb_change");
	if(nb_atr) {
	    //
	    // "nb_atr" is a String containing the name of the evenhandler function:
	    // just use that string as a hash key in the "window" object (default
	    // context) to retrieve a pointer the the named function.
	    //
	    elm.onchange = window[nb_atr];
	}
    }
}
//
// Add all event handlers specified in pseudo HTML attribute values
//
function add_controller_events(dad) {
    process_html_element(dad);
    var kids = dad.childNodes;
    for(var i=0; i < kids.length; ++i) {
	add_controller_events(kids[i]);
    }
}
//
// Add event handlers to board cells
//
function add_cell_handlers() {
    for(i = 7; i >= 0; --i) {
	//
	// A-file is column 0
	//
	for(j = 0; j < 8; ++j) {
	    var cellid = display_board.cell2id(i, j);
	    var c = document.querySelector("#" + cellid);
	    document.querySelector("#" + cellid).onclick = (function (r,c) { return function(){display_board.cell_clicked(r, c); }; })(i,j);
	}
    }
}
//
// onload handler = creates and initializes the board; also adds "onclick()" event handlers on
// all the individual squares and other event handlers specified in the "sb_click" dummy HTML attribute
//
function onload_handler() {
    //
    // Create chess board
    //
    create_board();
    //
    // Indicate which side is to move
    //
    display_board.mark_side2move();
    //
    // Add event handlers to catch clicking on individual squares
    //
    add_cell_handlers();
    //
    // Add additional event handlers based on artificial HTML attribute values
    //
    add_controller_events(document.body);
}
//
// Clear move notations
//
function clear_move_notation() {
    //
    // Update moves notation list
    //
    var fr = notation_element.firstChild;
    //
    // Skip clearing first table row = contains table headers
    //
    // Note: current implementation only works reliable of the
    // HTML does not include any gratuitous whitespace in the form of CDATA children...
    //
    var tr;
    while(tr = fr.nextSibling) {
	notation_element.removeChild(tr);
    }
}
//
// Set possible variations
//
// <option value="12">e4</option>
//
function set_variations() {
    html = display_board.print_variations_html();
    variation_element.innerHTML = html;
}
//
// Resize board when window changes size
//
function resize_stuff() {
    var w = document.documentElement.clientWidth;
    var h = document.documentElement.clientHeight;
    console.log("~~~ resize_stuff() -- current dimesions=[" + w +", " + h + "]");
}
