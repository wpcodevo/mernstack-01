import ReactDom from 'react-dom';
import React, { FC, CSSProperties } from 'react';
import { Container } from '@mui/material';

const OVERLAY_STYLES: CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0,0,0,.2)',
  zIndex: 1000,
};

const MODAL_STYLES: CSSProperties = {
  position: 'fixed',
  top: '10%',
  left: '50%',
  transform: 'translateX(-50%)',
  backgroundColor: 'white',
  zIndex: 1000,
};

type ICategoryModal = {
  openCategory: boolean;
  setOpenCategory: (openCategory: boolean) => void;
  children: React.ReactNode;
};

const CategoryModal: FC<ICategoryModal> = ({
  openCategory,
  setOpenCategory,
  children,
}) => {
  if (!openCategory) return null;
  return ReactDom.createPortal(
    <>
      <div style={OVERLAY_STYLES} onClick={() => setOpenCategory(false)} />
      <Container
        maxWidth='sm'
        sx={{ p: '2rem 1rem', borderRadius: 1 }}
        style={MODAL_STYLES}
      >
        {children}
      </Container>
    </>,
    document.getElementById('category-modal') as HTMLElement
  );
};

export default CategoryModal;
