import React, { SetStateAction } from 'react';
import { createPlugin } from 'react-plugin';
import { CoreSpec } from '../Core/spec.js';
import { RendererCoreSpec } from '../RendererCore/spec.js';
import { StorageSpec } from '../Storage/spec.js';
import { ResponsivePreview } from './ResponsivePreview/ResponsivePreview.js';
import { ToggleButton } from './ToggleButton/index.js';
import {
  DEFAULT_DEVICES,
  DEFAULT_VIEWPORT_STATE,
  FixtureStateWithViewport,
  ResponsivePreviewContext,
  VIEWPORT_STORAGE_KEY,
  ViewportState,
} from './shared.js';
import { ResponsivePreviewSpec, ResponsiveViewport } from './spec.js';

const { plug, namedPlug, register } = createPlugin<ResponsivePreviewSpec>({
  name: 'responsivePreview',
  defaultConfig: {
    devices: DEFAULT_DEVICES,
  },
});

plug('rendererPreviewOuter', ({ children, pluginContext }) => {
  const { getConfig } = pluginContext;
  const { devices } = getConfig();
  const { enabled, viewport, scaled } = getViewportState(pluginContext);
  const onViewportChange = useViewportChange(pluginContext);
  const onScaledChange = useScaledChange(pluginContext);

  return (
    <ResponsivePreview
      devices={devices}
      enabled={enabled}
      viewport={viewport}
      scaled={scaled}
      setViewport={onViewportChange}
      setScaled={onScaledChange}
    >
      {children}
    </ResponsivePreview>
  );
});

namedPlug('rendererAction', 'responsivePreview', ({ pluginContext }) => {
  const { getMethodsOf } = pluginContext;
  const core = getMethodsOf<CoreSpec>('core');
  const viewportState = getViewportState(pluginContext);
  const { enabled, viewport } = viewportState;

  if (!core.getWebRendererUrl()) return null;

  return (
    <ToggleButton
      selected={enabled}
      onToggle={() => {
        if (enabled) {
          setViewportState(pluginContext, { ...viewportState, enabled: false });
          setFixtureStateViewport(pluginContext, null);
        } else {
          setViewportState(pluginContext, { ...viewportState, enabled: true });
          setFixtureStateViewport(pluginContext, viewport);
        }
      }}
    />
  );
});

export { register };

if (process.env.NODE_ENV !== 'test') register();

function useViewportChange(context: ResponsivePreviewContext) {
  const viewportState = getViewportState(context);
  return React.useCallback(
    (viewportChange: SetStateAction<ResponsiveViewport>) => {
      const viewport =
        typeof viewportChange === 'function'
          ? viewportChange(viewportState.viewport)
          : viewportChange;
      setViewportState(context, { ...viewportState, enabled: true, viewport });
      setFixtureStateViewport(context, viewport);
    },
    [context, viewportState]
  );
}

function useScaledChange(context: ResponsivePreviewContext) {
  const viewportState = getViewportState(context);
  return React.useCallback(
    (scaled: boolean) =>
      setViewportState(context, { ...viewportState, scaled }),
    [context, viewportState]
  );
}

function getViewportState(context: ResponsivePreviewContext): ViewportState {
  const { getMethodsOf } = context;
  const storage = getMethodsOf<StorageSpec>('storage');
  const viewportState =
    storage.getItem<ViewportState>(VIEWPORT_STORAGE_KEY) ||
    DEFAULT_VIEWPORT_STATE;

  const rendererCore = getMethodsOf<RendererCoreSpec>('rendererCore');
  const fixtureState =
    rendererCore.getFixtureState() as FixtureStateWithViewport;

  return fixtureState.viewport
    ? { ...viewportState, enabled: true, viewport: fixtureState.viewport }
    : viewportState;
}

function setViewportState(
  context: ResponsivePreviewContext,
  viewportState: ViewportState
) {
  const { getMethodsOf } = context;
  const storage = getMethodsOf<StorageSpec>('storage');
  storage.setItem(VIEWPORT_STORAGE_KEY, viewportState);
}

function setFixtureStateViewport(
  context: ResponsivePreviewContext,
  viewport: null | ResponsiveViewport
) {
  const { getMethodsOf } = context;
  const rendererCore = getMethodsOf<RendererCoreSpec>('rendererCore');
  rendererCore.setFixtureState(fixtureState => ({
    ...fixtureState,
    viewport,
  }));
}
