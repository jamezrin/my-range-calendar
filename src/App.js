/** @jsx jsx */
/* @jsxFrag React.Fragment */
import { css, jsx, Global } from '@emotion/core';
import React from 'react';

import { subDays } from 'date-fns';
import normalize from 'normalize.css';

import Calendar from './Calendar';

export default function App() {
  const [startDate, setStartDate] = React.useState(subDays(new Date(), 200));
  const [endDate, setEndDate] = React.useState(new Date());
  return (
    <>
      <Global
        styles={css`
          ${normalize}
        `}
      />
      <div
        style={{
          display: 'flex',
          direction: 'column',
        }}
      >
        <div
          style={{
            marginLeft: 'auto',
          }}
        >
          <Calendar
            openSideDirectionLeft
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
