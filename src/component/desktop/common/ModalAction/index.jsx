import React, { ReactNode } from 'react';
import classNames from 'classnames';


import styles from './styles.module.css';
import {Modal, Button} from 'antd';

function ModalAction(props) {

  const handleCancel = () => {
    if (props.setVisible) {
      props?.setVisible();
    }
  };

  return (
    <Modal
      className={ classNames(styles.modals, props.centerText && styles.center, props?.className) }
      title={ props.title }
      footer={ null }
      visible={ props.visible }
      onCancel={ handleCancel }
      width={ props?.width || 'auto' }
      centered
    >
      <div className={ styles.formAction }>
        { props?.children }
      </div>
      <div className={ classNames(styles.groupButton, 'groupButton') }>
        {
          !props?.hiddenCancel &&
          <Button
            onClick={ handleCancel }
            type={ 'link' }
            className={ classNames(styles.button, styles.buttonCancel) }
          >
            { props.cancelText || 'Cancel' }
          </Button>
        }
        {
          props.handleClickOk &&
          <Button
            onClick={ () => props.handleClickOk && props.handleClickOk() }
            type={ 'link' }
            loading={ props?.loadingOk }
            className={ classNames(styles.button, styles.buttonOk, props?.disabled ? styles.disabled : null) }
            disabled={props?.disabled}
          >
            { props.okText || 'OK' }
          </Button>
        }

      </div>
    </Modal>
  );
}

export default ModalAction;
