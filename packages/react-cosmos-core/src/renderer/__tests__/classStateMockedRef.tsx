import retry from '@skidding/async-retry';
import until from 'async-until';
import delay from 'delay';
import React from 'react';
import { FixtureStatePrimitiveValue } from '../../fixtureState/types.js';
import { ClassStateMock } from '../../utils/react/ClassStateMock.js';
import { uuid } from '../../utils/uuid.js';
import { Counter } from '../testHelpers/components.js';
import { getClassState } from '../testHelpers/fixtureState.js';
import { testRenderer } from '../testHelpers/testRenderer.js';
import { wrapActSetTimeout } from '../testHelpers/wrapActSetTimeout.js';
import { wrapDefaultExport } from '../testHelpers/wrapDefaultExport.js';

beforeAll(wrapActSetTimeout);

let counterRef: null | Counter = null;
beforeEach(() => {
  counterRef = null;
});

const rendererId = uuid();
const getFixtures = () =>
  wrapDefaultExport({
    first: (
      <ClassStateMock state={{ count: 5 }}>
        <Counter
          ref={elRef => {
            if (elRef) {
              counterRef = elRef;
            }
          }}
        />
      </ClassStateMock>
    ),
  });
const fixtureId = { path: 'first' };

testRenderer(
  'captures component state changes',
  { rendererId, fixtures: getFixtures() },
  async ({ selectFixture, getLastFixtureState }) => {
    selectFixture({
      rendererId,
      fixtureId,
      fixtureState: {},
    });
    await until(() => counterRef);
    counterRef!.setState({ count: 7 });
    await retry(async () => expect(await getCount()).toBe(7));

    // Simulate a small pause between updates
    await delay(500);

    counterRef!.setState({ count: 13 });
    await retry(async () => expect(await getCount()).toBe(13));

    async function getCount(): Promise<null | number> {
      const fixtureState = await getLastFixtureState();
      const [{ values }] = getClassState(fixtureState);
      if (!values) return null;
      const countValue = values.count as FixtureStatePrimitiveValue;
      return countValue.data as number;
    }
  }
);
