import React from 'react';
import {render} from 'react-dom';
import ConfigApp from '../component/config';
import './config.module.css';
import 'antd/dist/reset.css';

(PLUGIN_ID => {

    function App (props) {
        // eslint-disable-next-line react/prop-types
        return <div>Config APP</div>
    }

    render(
        <App data={kintone.plugin.app.getConfig(PLUGIN_ID).data} />,
        document.getElementById('config-root')
    );
})(kintone.$PLUGIN_ID);