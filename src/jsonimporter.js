import { useEffect, useState, createPortal } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import classnames from 'classnames';
import { dispatch, select } from '@wordpress/data';
import { createBlock, getBlockType } from '@wordpress/blocks';
import { equal } from '@sonofjs/js-compare';

export const EscListener = ({ execute }) => {
    const escFunction = event => {
        if (event.keyCode === 27) {
            execute();
        }
    };

    useEffect(() => {
        document.addEventListener('keydown', escFunction, false);
        return () => {
            document.removeEventListener('keydown', escFunction, false);
        };
    }, []);

    return null;
};

export const getEditSiteHeader = () => {
    return new Promise(resolve => {
        setTimeout(() => {
            let header = document.getElementsByClassName('edit-post-header-toolbar')[0];
            header = header ? header : document.getElementsByClassName('edit-site-header_start')[0];
            header = header ? header : document.getElementsByClassName('edit-site-header-edit-mode__start')[0];
            header = header ? header : document.getElementsByClassName('edit-site-header-edit-mode__center')[0];
            header = header ? header : document.getElementsByClassName('edit-site-header-edit-mode__end')[0];

            resolve(header);
        }, 1000);
    });
};

export const IconCloseSVG = ({ size = 16, ...props }) => {
    return <svg {...props} width={size} height={size} viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
        <path fillRule="evenodd" clipRule="evenodd" d="M8 8.707l3.646 3.647.708-.707L8.707 8l3.647-3.646-.707-.708L8 7.293 4.354 3.646l-.707.708L7.293 8l-3.646 3.646.707.708L8 8.707z" />
    </svg>;
};

const rebuildingAttribute = (attributes, defaultAttributes, name) => {
    const data = {};

    Object.keys(attributes).map(key => {
        const { default: initial } = defaultAttributes[key];
        const value = attributes[key];
        if ('elementId' === key) return;
        if (!equal(value, initial)) data[key] = value;
    });

    if (name === 'gutenverse/column') {
        data.adjustSiblingColumn = false;
    }

    return data;
};

const recursiveArray = (blocks) => {
    return blocks.map(block => {
        const { attributes, innerBlocks, name } = block;
        const { attributes: defaultAttributes } = getBlockType(name);
        const theInnerBlocks = recursiveArray(innerBlocks);
        let theAttributes = rebuildingAttribute(attributes, defaultAttributes, name);
        let data = {
            attributes: theAttributes,
            name
        };

        // Check if Inner Block Exist.
        if (theInnerBlocks.length) {
            data = {
                ...data,
                innerBlocks: theInnerBlocks
            };
        }

        return data;
    });
};


export const ImportModal = (props) => {
    const delay = 100;
    const [value, setValue] = useState('');
    const [blocks, setBlockData] = useState({});
    const [finish, setFinished] = useState(false);
    const {
        open,
        visible,
        setVisibility,
        mode,
        setMode
    } = props;

    const { updateBlockAttributes } = dispatch('core/block-editor');
    const { getBlock } = select('core/block-editor');

    useEffect(() => {
        if (finish) {
            for (const clientId of Object.keys(blocks)) {
                const block = getBlock(clientId);
                if (block) {
                    const { name } = block;
                    if ('gutenverse/column' === name) {
                        updateBlockAttributes(clientId, {
                            adjustSiblingColumn: true
                        });
                    }
                }
            }

            setFinished(false);
            setBlockData({});
        }
    }, [blocks, finish]);

    const importerClass = classnames('import-modal', {
        'visible': visible
    });

    async function parseArrayToBlocks(dataArray, parentId) {
        const { insertBlock } = dispatch('core/block-editor');

        for (const item of dataArray) {
            const { name, attributes, innerBlocks } = item;

            const blockData = createBlock(name, attributes);
            const { clientId } = blockData;

            if (parentId) {
                await insertBlock(blockData, 9999, parentId);
            } else {
                await insertBlock(blockData);
            }

            await new Promise((resolve) => setTimeout(resolve, delay));

            setBlockData(value => {
                return {
                    ...value,
                    [clientId]: attributes
                };
            });

            if (innerBlocks && innerBlocks.length) {
                await parseArrayToBlocks(innerBlocks, clientId);
            }
        }

        await new Promise((resolve) => setTimeout(resolve, delay));
    }

    const importContent = async (value) => {
        const data = JSON.parse(value);
        setVisibility(false);
        await parseArrayToBlocks(data, null);
        setFinished(true);
    };

    const exportContent = () => {
        const blocks = select('core/block-editor').getBlocks();
        const data = recursiveArray(blocks);
        if (mode === 'tab') {
            setValue(JSON.stringify(data, null, 4));
        } else {
            setValue(JSON.stringify(data, null));
        }
    };

    const changeMode = () => {
        setMode(mode === 'tab' ? 'plain' : 'tab');
        const temporary = JSON.parse(value);
        if (mode === 'tab') {
            setValue(JSON.stringify(temporary, null));
        } else {
            setValue(JSON.stringify(temporary, null, 4));
        }
    };

    return open && <div className={importerClass}>
        <div className="import-modal-overlay" onClick={() => setVisibility(false)}></div>
        <div className="import-modal-container">
            <div className="import-modal-header">
                <div className="import-title">
                    <h3>{__('Import JSON', 'weji')}</h3>
                </div>
                <div className="close">
                    <div className={'gutenverse-close'} onClick={() => setVisibility(false)}>
                        <IconCloseSVG size={20} />
                    </div>
                </div>
            </div>
            <div className="import-modal-body">
                <textarea
                    value={value}
                    onChange={event => setValue(event.target.value)}
                    placeholder={'Enter JSON Data . . . .'}
                />
            </div>
            <div className="import-modal-footer">
                <div className="import-modal-length">
                    {__('Length:', 'weji')} {value.length}
                </div>
                <div className="import-modal-action">
                    <div className="import-content button" onClick={() => importContent(value)}>
                        {__('Import', 'weji')}
                    </div>
                    <div className="import-content button" onClick={() => exportContent()}>
                        {__('Export', 'weji')}
                    </div>
                    <div className="import-content button mode" onClick={() => changeMode()}>
                        {mode === 'tab' ? __('Tab Mode', 'weji') : __('Plain Mode', 'weji')}
                    </div>
                    <div className="import-content button clear" onClick={() => setValue('')}>
                        {__('Clear', 'weji')}
                    </div>
                </div>
            </div>
        </div>
    </div>;
};

const JSONImporter = () => {
    const [injectLocation, setInjectLocation] = useState(null);
    const [open, setOpen] = useState(false);
    const [visible, setVisibility] = useState(true);
    const [jsonMode, setJsonMode] = useState('tab');

    useEffect(() => {
        getEditSiteHeader().then(result => {
            setInjectLocation(result);
        });
    });

    const importButton = (
        <div className="weji-button" onClick={() => {
            setOpen(true);
            setVisibility(true);
        }}>
            <span>{__('Import JSON', 'weji')}</span>
        </div>
    );

    return <>
        <EscListener execute={() => setVisibility(false)} />
        <ImportModal
            open={open}
            setOpen={setOpen}
            visible={visible}
            setVisibility={setVisibility}
            mode={jsonMode}
            setMode={setJsonMode}
        />
        {injectLocation && createPortal(importButton, injectLocation)}
    </>;
};

export default JSONImporter;