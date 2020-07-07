/** @jsx jsx */
/* @jsxFrag React.Fragment */
import { css, jsx, Global } from '@emotion/core';
import React from 'react';

import { subDays } from 'date-fns';
import normalize from 'normalize.css';

import Calendar, { WEEK_START_MONDAY, WEEK_START_SUNDAY } from './Calendar';

export default function App() {
  const [startDate, setStartDate] = React.useState(subDays(new Date(), 20));
  const [endDate, setEndDate] = React.useState(new Date());

  React.useEffect(() => {
    setStartDate(null);
    setEndDate(null);
  }, []);

  return (
    <>
      <Global
        styles={css`
          ${normalize}
        `}
      />
      <div
        css={{
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div
          css={{
            marginLeft: 'auto',
          }}
        >
          <Calendar
            openSideDirectionLeft
            weekStartDay={WEEK_START_MONDAY}
            startDate={startDate}
            setStartDate={setStartDate}
            endDate={endDate}
            setEndDate={setEndDate}
          />
        </div>
      </div>
    </>
  );
}
