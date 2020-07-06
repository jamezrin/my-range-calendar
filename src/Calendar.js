/** @jsx jsx */
/* @jsxFrag React.Fragment */
import { css, jsx } from '@emotion/core';
import React from 'react';

import {
  format,
  subDays,
  isSameYear,
  isSameMonth,
  getDate,
  isThisYear,
  getMonth,
  getYear,
  subMonths,
  addMonths,
  getDaysInMonth,
  eachDayOfInterval,
  eachDay,
  getDay,
  startOfMonth,
  endOfMonth,
  addDays,
} from 'date-fns';

const mdashCharacter = '\u2014';

const defaultButtonTextFormatter = (startDate, endDate) => {
  if (!isSameYear(startDate, endDate)) {
    if (!isThisYear(endDate)) {
      return format(startDate, 'MMM dd, yyyy') + ` ${mdashCharacter} ` + format(endDate, 'MMM dd, yyyy');
    }

    return format(startDate, 'MMM dd, yyyy') + ` ${mdashCharacter} ` + format(endDate, 'MMM dd');
  }

  if (!isSameMonth(startDate, endDate)) {
    return format(startDate, 'MMM dd') + ` ${mdashCharacter} ` + format(endDate, 'MMM dd');
  }

  return format(startDate, 'MMM dd') + ` ${mdashCharacter} ` + getDate(endDate);
};

export default function Calendar({
  buttonTextFormatter = defaultButtonTextFormatter,
  openSideDirectionLeft = false,
  weekStartDay = 0,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
}) {
  const [visible, setVisible] = React.useState(localStorage.getItem('visible') === 'yes');

  React.useEffect(() => {
    localStorage.setItem('visible', visible ? 'yes' : 'no');
  }, [visible]);

  const [selectedDate, setSelectedDate] = React.useState();
  const [selectedMonthDate, setSelectedMonthDate] = React.useState(endDate);

  const buttonDisplayText = React.useMemo(() => buttonTextFormatter(startDate, endDate), [
    startDate,
    endDate,
    buttonTextFormatter,
  ]);

  const weekDays = React.useMemo(() => {
    return [...Array(7)].map((_, i) => {
      const j = i + weekStartDay;
      if (j >= 7) return j - 7;
      return j;
    });
  }, [weekStartDay]);

  const calendarDates = React.useMemo(() => {
    const monthStartDate = startOfMonth(selectedMonthDate);
    const monthEndDate = endOfMonth(selectedMonthDate);
    const firstMonthDay = getDay(monthStartDate);

    const dates = [];

    // Before the current month
    if (firstMonthDay > 1) {
      dates.push(
        ...eachDayOfInterval({
          start: subDays(monthStartDate, firstMonthDay - 1),
          end: subDays(monthStartDate, 1),
        }),
      );
    } else {
      dates.push(
        ...eachDayOfInterval({
          start: subDays(monthStartDate, 7),
          end: subDays(monthStartDate, 1),
        }),
      );
    }

    // The current month dates
    dates.push(
      ...eachDayOfInterval({
        start: monthStartDate,
        end: monthEndDate,
      }),
    );

    // After the current month, if there is space
    if (dates.length < 42) {
      dates.push(
        ...eachDayOfInterval({
          start: addDays(monthEndDate, 1),
          end: addDays(monthEndDate, 42 - dates.length),
        }),
      );
    }

    return dates;
  }, [selectedMonthDate]);

  return (
    <div
      css={css`
        position: relative;
      `}
    >
      <button
        onClick={() => setVisible(!visible)}
        css={css`
          padding: 0.6rem;
        `}
      >
        {buttonDisplayText}
      </button>
      <div
        css={css`
          display: ${visible ? 'block' : 'none'};
          position: absolute;
          top: 100%;
          margin: 3px 0 0 0;
          ${openSideDirectionLeft ? 'right' : 'left'}: 0;
        `}
      >
        <div
          css={css`
            width: 400px;
            height: 400px;
            background: #ababab;
            display: flex;
            flex-direction: column;
          `}
        >
          <div
            css={css`
              display: flex;
              flex-direction: row;
              justify-content: space-between;
            `}
          >
            <button css={css``} onClick={() => setSelectedMonthDate(subMonths(selectedMonthDate, 1))}>
              &larr;
            </button>
            <div css={css``}>{format(selectedMonthDate, 'MMMM yyyy')}</div>
            <button css={css``} onClick={() => setSelectedMonthDate(addMonths(selectedMonthDate, 1))}>
              &rarr;
            </button>
          </div>
          <div
            css={css`
              display: flex;
              flex-direction: row;
              flex-grow: 1;
              padding: 8px;
            `}
          >
            <div
              css={css`
                flex-basis: 30%;
                background: #a7a7a7;
                display: flex;
                flex-direction: column;
              `}
            >
              <ul
                css={css`
                  display: flex;
                  list-style-type: none;
                  padding: 0;
                  flex-direction: column;
                  flex-grow: 1;
                  justify-content: flex-end;
                `}
              >
                <li>
                  <button>Current week</button>
                </li>
                <li>
                  <button>Last 7 days</button>
                </li>
                <li>
                  <button>Current month</button>
                </li>
                <li>
                  <button>Last 3 months</button>
                </li>
                <li>
                  <button>Custom</button>
                </li>
              </ul>
            </div>
            <div
              css={css`
                flex-basis: 70%;
                background: #a0a0a0;
              `}
            >
              <div>
                <div>
                  <ul
                    css={css`
                      list-style-type: none;
                      padding: 0;
                      display: flex;
                      flex-direction: row;
                      justify-content: space-evenly;
                    `}
                  >
                    {weekDays.map((weekDay) => (
                      /* Month of a year that where monday is the first day */
                      <li>{format(new Date(2020, 5, weekDay + 1), 'EEE')}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <ul
                    css={css`
                      list-style-type: none;
                      display: flex;
                      flex-direction: row;
                    `}
                  >
                    {calendarDates.map((calendarDate) => (
                      <li>{getDate(calendarDate)}&nbsp;</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
