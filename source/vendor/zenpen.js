/**
 * ZenPen is Copyright (c) Tim Holman, released under Apache 2.0 licence
 * 
 * https://github.com/tholman/zenpen
 */
var localStorage = window.localStorage
var setTimeout   = window.setTimeout
var signal       = require('shoutout')

// Utility functions
function supportsHtmlStorage() {
	try {
		return 'localStorage' in window && window['localStorage'] !== null;
	} catch (e) {
		return false;
	}
}

function get_text(el) {
    var ret = " ";
    var length = el.childNodes.length;
    for(var i = 0; i < length; i++) {
        var node = el.childNodes[i];
        if(node.nodeType != 8) {

        	if ( node.nodeType != 1 ) {
        		// Strip white space.
        		ret += node.nodeValue;
        	} else {
        		ret += get_text( node );
        	}
        }
    }
    return ret.trim();
}

// Zen Pen editor
var editor = (function() {

	// Editor elements
	var headerField, contentField, cleanSlate, lastType, currentNodeList, savedSelection;

	// Editor Bubble elements
	var textOptions, optionsBox, boldButton, italicButton, quoteButton, headerButton, urlButton, urlInput;

	var composing;

  var lastSelection;

  var onChange = signal();
  var onSelect = signal();

  function notifyChange() {
    onChange({
      header: headerField,
      content: contentField,
      headerText: headerField.innerText,
      contentText: contentField.innerText
    })
  }

	function init() {

		composing = false;
		bindElements();

		// Set cursor position
		var range = document.createRange();
		var selection = window.getSelection();
		range.setStart(contentField, 1);
		selection.removeAllRanges();
		selection.addRange(range);

    document.execCommand('defaultParagraphSeparator', false, 'p');
		createEventBindings();
	}

  function moveToEnd() {
    var range = document.createRange();
    range.selectNodeContents(contentField);
    range.collapse(false);
    var sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
  }

	function createEventBindings() {

		// Key up bindings
	  document.onkeyup = function( event ) {
		  checkTextHighlighting( event );
      notifyChange();
		}

		// Mouse bindings
		document.onmousedown = checkTextHighlighting;
		document.onmouseup = function( event ) {

			setTimeout( function() {
				checkTextHighlighting( event );
			}, 1);
		};
		
		// Window bindings
		window.addEventListener( 'resize', function( event ) {
			updateBubblePosition();
		});


		document.body.addEventListener( 'scroll', function() {

			// TODO: Debounce update bubble position to stop excessive redraws
			updateBubblePosition();
		});

		// Composition bindings. We need them to distinguish
		// IME composition from text selection
		document.addEventListener( 'compositionstart', onCompositionStart );
		document.addEventListener( 'compositionend', onCompositionEnd );
	}


	function bindElements() {

		headerField = document.querySelector( '.header' );
		contentField = document.querySelector( '.content' );
    window.$(contentField).on('click', notifyChange);

		textOptions = document.querySelector( '.text-options' );
    window.$(textOptions).on('click', notifyChange);

		optionsBox = textOptions.querySelector( '.options' );

		boldButton = textOptions.querySelector( '.bold' );
		boldButton.onclick = onBoldClick;

		italicButton = textOptions.querySelector( '.italic' );
		italicButton.onclick = onItalicClick;

		quoteButton = textOptions.querySelector( '.quote' );
		quoteButton.onclick = onQuoteClick;

    headerButton = textOptions.querySelector( '.add-header' );
    headerButton.onclick = onHeaderClick;

		urlButton = textOptions.querySelector( '.url' );
		urlButton.onmousedown = onUrlClick;

		urlInput = textOptions.querySelector( '.url-input' );
		urlInput.onblur = onUrlInputBlur;
		urlInput.onkeydown = onUrlInputKeyDown;
	}

	function checkTextHighlighting( event ) {

		var selection = window.getSelection();

    onSelect(selection);

		if ( (event.target.className === "url-input" ||
		    event.target.classList.contains( "url" ) ||
		    event.target.parentNode.classList.contains( "ui-inputs" ) ) ) {

			currentNodeList = findNodes( selection.focusNode );
			updateBubbleStates();
			return;
		}

		// Check selections exist
		if ( selection.isCollapsed === true && lastType === false ) {

			onSelectorBlur();
		}

		// Text is selected
		if ( selection.isCollapsed === false && composing === false ) {

			currentNodeList = findNodes( selection.focusNode );

			// Find if highlighting is in the editable area
			if ( hasNode( currentNodeList, "ARTICLE") ) {
				updateBubbleStates();
				updateBubblePosition();

				// Show the ui bubble
				textOptions.className = "text-options active";
			}
		}

		lastType = selection.isCollapsed;
	}
	
	function updateBubblePosition() {
		var selection = window.getSelection();
		var range = selection.getRangeAt(0);
		var boundary = range.getBoundingClientRect();
		
		textOptions.style.top = boundary.top - 5 + window.pageYOffset + "px";
		textOptions.style.left = (boundary.left + boundary.right)/2 + "px";
	}

	function updateBubbleStates() {

		// It would be possible to use classList here, but I feel that the
		// browser support isn't quite there, and this functionality doesn't
		// warrent a shim.

		if ( hasNode( currentNodeList, 'B') ) {
			boldButton.className = "bold active"
		} else {
			boldButton.className = "bold"
		}

		if ( hasNode( currentNodeList, 'I') ) {
			italicButton.className = "italic active"
		} else {
			italicButton.className = "italic"
		}

		if ( hasNode( currentNodeList, 'BLOCKQUOTE') ) {
			quoteButton.className = "quote entypo active"
		} else {
			quoteButton.className = "quote entypo"
		}

    if ( hasNode( currentNodeList, 'H2' ) ) {
      headerButton.className = 'header active'
    } else {
      headerButton.className = 'header'
    }

		if ( hasNode( currentNodeList, 'A') ) {
			urlButton.className = "url entypo active"
		} else {
			urlButton.className = "url entypo"
		}
	}

	function onSelectorBlur() {

		textOptions.className = "text-options fade";
		setTimeout( function() {

			if (textOptions.className == "text-options fade") {

				textOptions.className = "text-options";
				textOptions.style.top = '-999px';
				textOptions.style.left = '-999px';
			}
		}, 260 )
	}

	function findNodes( element ) {

		var nodeNames = {};

		// Internal node?
		var selection = window.getSelection();

		// if( selection.containsNode( document.querySelector('b'), false ) ) {
		// 	nodeNames[ 'B' ] = true;
		// }

		while ( element.parentNode ) {

			nodeNames[element.nodeName] = true;
			element = element.parentNode;

			if ( element.nodeName === 'A' ) {
				nodeNames.url = element.href;
			}
		}

		return nodeNames;
	}

	function hasNode( nodeList, name ) {

		return !!nodeList[ name ];
	}

  function onHeaderClick() {
    var nodeNames = findNodes(window.getSelection().focusNode);
    if (hasNode(nodeNames, 'H2')) {
      document.execCommand('formatBlock', false, 'p');
    } else {
      document.execCommand('formatBlock', false, 'H2');
    } 
  }

	function onBoldClick() {
		document.execCommand( 'bold', false );
	}

	function onItalicClick() {
		document.execCommand( 'italic', false );
	}

	function onQuoteClick() {

		var nodeNames = findNodes( window.getSelection().focusNode );

		if ( hasNode( nodeNames, 'BLOCKQUOTE' ) ) {
			document.execCommand( 'formatBlock', false, 'p' );
			document.execCommand( 'outdent' );
		} else {
			document.execCommand( 'formatBlock', false, 'blockquote' );
		}
	}

	function onUrlClick() {

		if ( optionsBox.className == 'options' ) {

			optionsBox.className = 'options url-mode';

			// Set timeout here to debounce the focus action
			setTimeout( function() {

				var nodeNames = findNodes( window.getSelection().focusNode );

				if ( hasNode( nodeNames , "A" ) ) {
					urlInput.value = nodeNames.url;
				} else {
					// Symbolize text turning into a link, which is temporary, and will never be seen.
					document.execCommand( 'createLink', false, '/' );
				}

				// Since typing in the input box kills the highlighted text we need
				// to save this selection, to add the url link if it is provided.
				lastSelection = window.getSelection().getRangeAt(0);
				lastType = false;

				urlInput.focus();

			}, 100);

		} else {

			optionsBox.className = 'options';
		}
	}

	function onUrlInputKeyDown( event ) {

		if ( event.keyCode === 13 ) {
			event.preventDefault();
			applyURL( urlInput.value );
			urlInput.blur();
		}
	}

	function onUrlInputBlur( event ) {

		optionsBox.className = 'options';
		applyURL( urlInput.value );
		urlInput.value = '';

		currentNodeList = findNodes( window.getSelection().focusNode );
		updateBubbleStates();
	}

	function applyURL( url ) {

		rehighlightLastSelection();

		// Unlink any current links
		document.execCommand( 'unlink', false );

		if (url !== "") {
		
			// Insert HTTP if it doesn't exist.
			if ( !url.match("^(http|https)://") ) {

				url = "http://" + url;	
			} 

			document.execCommand( 'createLink', false, url );
		}
	}

	function rehighlightLastSelection() {

		window.getSelection().addRange( lastSelection );
	}

	function getWordCount() {
		
		var text = get_text( contentField );

		if ( text === "" ) {
			return 0
		} else {
			return text.split(/\s+/).length;
		}
	}

	function onCompositionStart ( event ) {
		composing = true;
	}

	function onCompositionEnd (event) {
		composing = false;
	}

	return {
		init: init,
    onChange: onChange,
    onSelect: onSelect,
    moveToEnd: moveToEnd    
	}

})();

module.exports = editor
