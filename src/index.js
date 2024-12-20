import { render } from '@wordpress/element';
import domReady from '@wordpress/dom-ready';
import elementChange from 'element-change';
import JSONImporter from './jsonimporter';

elementChange('#site-editor', () => {
    const button = document.getElementById('weji-button');

    if (button === null) {
        const content = <JSONImporter />;
        render(content, document.getElementById('weji-root'));
    }
});


domReady(() => {
    if (document.getElementById('weji-root')) {
        const content = <JSONImporter />;
        render(content, document.getElementById('weji-root'));
    }
});