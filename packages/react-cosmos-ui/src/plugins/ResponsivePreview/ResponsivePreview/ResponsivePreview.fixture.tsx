import React from 'react';
import { useValue } from 'react-cosmos-core';
import styled from 'styled-components';
import { DEFAULT_DEVICES } from '../shared.js';
import { ResponsivePreview } from './ResponsivePreview.js';

const { width, height } = DEFAULT_DEVICES[0];
const initialViewport = { width, height };

export default () => {
  const [viewport, setViewport] = useValue('viewport', {
    defaultValue: initialViewport,
  });
  const [scaled, setScaled] = useValue<boolean>('scaled', {
    defaultValue: false,
  });
  return (
    <Container>
      <ResponsivePreview
        devices={DEFAULT_DEVICES}
        enabled={true}
        viewport={viewport}
        scaled={scaled}
        setViewport={setViewport}
        setScaled={setScaled}
      />
    </Container>
  );
};

const Container = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
`;
