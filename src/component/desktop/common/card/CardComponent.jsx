// eslint-disable-next-line no-unused-vars
import React from 'react';
import styles from './styles.module.css';

export default function CardComponent({
  btnLeft,
  btnRight,
  title,
  onClickLeft,
  onClickRight,
  children
}) {

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.left}>
          {
            btnLeft &&
            <span className={'cursor'} onClick={() => onClickLeft && onClickLeft()}>
              {btnLeft}
            </span>
          }
        </div>
        <div className={styles.title}>
          <span>
            {title}
          </span>
        </div>
        <div className={styles.right}>
          {
            btnRight &&
            <span className={'cursor'} onClick={() => onClickRight && onClickRight()}>
              {btnRight}
            </span>
          }
        </div>
      </div>
      <div className={styles.content}>
        {children}
      </div>
    </div>
  );
}