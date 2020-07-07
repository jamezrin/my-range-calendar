/** @jsx jsx */
/* @jsxFrag React.Fragment */
import { css, jsx } from '@emotion/core';
import styled from '@emotion/styled';
import React from 'react';

import {
  format,
  subDays,
  isSameYear,
  isSameMonth,
  getDate,
  isThisYear,
  subMonths,
  addMonths,
  eachDayOfInterval,
  getDay,
  startOfMonth,
  endOfMonth,
  addDays,
  isWithinInterval,
  isSameDay,
  isBefore,
  isAfter,
} from 'date-fns';
import { isThisMonth } from 'date-fns/esm';

const mdashCharacter = '\u2014';
const calendarWeeks = 6;
const daysInWeek = 7;

export const WEEK_START_MONDAY = 0,
  WEEK_START_SUNDAY = 6;

const safeFormat = (date, pattern, ...options) => {
  if (!date) return 'None';
  return format(date, pattern, ...options);
};

const defaultButtonTextFormatter = (startDate, endDate) => {
  if (!isSameYear(startDate, endDate)) {
    if (!isThisYear(endDate)) {
      return safeFormat(startDate, 'MMM dd, yyyy') + ` ${mdashCharacter} ` + safeFormat(endDate, 'MMM dd, yyyy');
    }
    return safeFormat(startDate, 'MMM dd, yyyy') + ` ${mdashCharacter} ` + safeFormat(endDate, 'MMM dd');
  }
  if (!isSameMonth(startDate, endDate)) {
    return safeFormat(startDate, 'MMM dd') + ` ${mdashCharacter} ` + safeFormat(endDate, 'MMM dd');
  }
  return safeFormat(startDate, 'MMM dd') + ` ${mdashCharacter} ` + endDate ? getDate(endDate) : 'None';
};

const DatePresetSelector = styled.button`
  cursor: pointer;
  background: none;
  border: none;
`;

const DateSelector = styled.button`
  cursor: pointer;
  border-radius: 100%;
  width: 35px;
  height: 35px;
  background: #fff;
  border: 1px solid #e4e7ea;
`;

export default function Calendar({
  buttonTextFormatter = defaultButtonTextFormatter,
  openSideDirectionLeft = false,
  weekStartDay = WEEK_START_MONDAY,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
}) {
  // save in localStorage to improve development experience
  const [visible, setVisible] = React.useState(localStorage.getItem('visible') === 'yes');
  React.useEffect(() => localStorage.setItem('visible', visible ? 'yes' : 'no'), [visible]);

  const [selectedDate, setSelectedDate] = React.useState();
  const [selectedMonthDate, setSelectedMonthDate] = React.useState(endDate);
  const [hoveringDate, setHoveringDate] = React.useState();

  const buttonDisplayText = React.useMemo(() => buttonTextFormatter(startDate, endDate), [
    startDate,
    endDate,
    buttonTextFormatter,
  ]);

  const goPreviousMonth = () => setSelectedMonthDate(subMonths(selectedMonthDate, 1));
  const goNextMonth = () => setSelectedMonthDate(addMonths(selectedMonthDate, 1));

  const calendarDayBorderRadius = (calendarDate) => {
    if (
      (startDate && (!selectedDate || (selectedDate && !hoveringDate)) && isSameDay(calendarDate, startDate)) ||
      (selectedDate && hoveringDate && isBefore(calendarDate, startDate) && isSameDay(calendarDate, hoveringDate)) ||
      (!startDate &&
        !endDate &&
        selectedDate &&
        hoveringDate &&
        isSameDay(calendarDate, hoveringDate) &&
        isBefore(hoveringDate, selectedDate))
    )
      return '50% 0 0 50%';
    if (
      (endDate && (!selectedDate || (selectedDate && !hoveringDate)) && isSameDay(calendarDate, endDate)) ||
      (selectedDate && hoveringDate && isAfter(calendarDate, endDate) && isSameDay(calendarDate, hoveringDate)) ||
      (!startDate &&
        !endDate &&
        selectedDate &&
        hoveringDate &&
        isSameDay(calendarDate, hoveringDate) &&
        isAfter(hoveringDate, selectedDate))
    )
      return '0 50% 50% 0';
    return 0;
  };

  const calendarDayBackground = (currentDate) => {
    return (startDate && isSameDay(currentDate, startDate)) ||
      (endDate && isSameDay(currentDate, endDate)) ||
      (startDate &&
        endDate &&
        isWithinInterval(currentDate, {
          start: startDate,
          end: endDate,
        })) ||
      (selectedDate &&
        hoveringDate &&
        isWithinInterval(currentDate, {
          start: Math.min(selectedDate, hoveringDate),
          end: Math.max(selectedDate, hoveringDate),
        }))
      ? '#EDF2F7'
      : '#FFF';
  };

  const calendarDayColor = (currentDate) => {
    if (
      (startDate && isSameDay(currentDate, startDate)) ||
      (endDate && isSameDay(currentDate, endDate)) ||
      (!startDate && !endDate && selectedDate && isSameDay(currentDate, selectedDate))
    )
      return '#3182CE';
    return 'transparent';
  };

  const handleDayClick = (clickedDate) => {
    if (selectedDate && startDate && endDate) {
      if (isBefore(clickedDate, startDate)) {
        setStartDate(clickedDate);
      } else if (isAfter(clickedDate, endDate)) {
        setEndDate(clickedDate);
      } else if (isSameDay(startDate, selectedDate)) {
        setStartDate(clickedDate);
      } else if (isSameDay(endDate, selectedDate)) {
        setEndDate(clickedDate);
      }

      setSelectedDate(null);
    } else {
      if ((startDate && isSameDay(clickedDate, startDate)) || (endDate && isSameDay(clickedDate, endDate))) {
        setSelectedDate(clickedDate);
      } else if (selectedDate) {
        setStartDate(Math.min(selectedDate, clickedDate));
        setEndDate(Math.max(selectedDate, clickedDate));
        setSelectedDate(null);
      } else {
        setSelectedDate(clickedDate);
        setStartDate(null);
        setEndDate(null);
      }
    }
  };

  const weekDays = React.useMemo(() => {
    return [...Array(daysInWeek)].map((_, i) => {
      const j = i + weekStartDay;
      if (j >= daysInWeek) return j - daysInWeek;
      return j;
    });
  }, [weekStartDay]);

  const calendarDates = React.useMemo(() => {
    const monthStartDate = startOfMonth(selectedMonthDate);
    const monthEndDate = endOfMonth(selectedMonthDate);
    const firstMonthDay = getDay(monthStartDate);

    const dates = [];

    // Before the current month
    dates.push(
      ...eachDayOfInterval({
        start: subDays(
          monthStartDate,
          (firstMonthDay % daysInWeek > 1 ? firstMonthDay - 1 : daysInWeek) +
            (weekStartDay !== 0 ? daysInWeek - weekStartDay : 0),
        ),
        end: subDays(monthStartDate, 1),
      }),
    );

    // The current month dates
    dates.push(
      ...eachDayOfInterval({
        start: monthStartDate,
        end: monthEndDate,
      }),
    );

    // After the current month, if there is space
    // the number of weeks (6) is multiplied by the days
    // that there are in a week (7), resulting in 42
    if (dates.length < daysInWeek * calendarWeeks) {
      dates.push(
        ...eachDayOfInterval({
          start: addDays(monthEndDate, 1),
          end: addDays(monthEndDate, daysInWeek * calendarWeeks - dates.length),
        }),
      );
    }

    return [...Array(calendarWeeks)].map((_, i) => {
      return dates.slice(i * daysInWeek, i * daysInWeek + daysInWeek);
    });
  }, [selectedMonthDate, weekStartDay]);

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
            box-shadow: 0 3px 3px rgba(0, 0, 0, 0.2);
            background: #fff;
            border-radius: 3px;
            display: flex;
            flex-direction: column;
          `}
        >
          <div
            css={css`
              display: flex;
              flex-direction: row;
              justify-content: space-between;
              margin: 0.75em 0;
            `}
          >
            <DateSelector
              css={css`
                margin-left: 3em;
              `}
              onClick={goPreviousMonth}
            >
              &larr;
            </DateSelector>
            <div
              css={css`
                align-self: center;
                font-size: 1.25em;
              `}
            >
              {format(selectedMonthDate, 'MMMM yyyy')}
            </div>
            <DateSelector
              css={css`
                margin-right: 3em;
              `}
              onClick={goNextMonth}
            >
              &rarr;
            </DateSelector>
          </div>
          <div
            css={css`
              display: flex;
              flex-direction: row;
              flex-grow: 1;
            `}
          >
            <div
              css={css`
                flex-basis: 30%;
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
                <li>start: {startDate ? format(startDate, 'dd/MM/yyyy') : 'none'}</li>
                <li>end: {endDate ? format(endDate, 'dd/MM/yyyy') : 'none'}</li>
                <li>selected: {selectedDate ? format(selectedDate, 'dd/MM/yyyy') : 'none'}</li>
                <li>hovering: {hoveringDate ? format(hoveringDate, 'dd/MM/yyyy') : 'none'}</li>

                <li>
                  <DatePresetSelector>Current week</DatePresetSelector>
                </li>
                <li>
                  <DatePresetSelector>Last 7 days</DatePresetSelector>
                </li>
                <li>
                  <DatePresetSelector>Current month</DatePresetSelector>
                </li>
                <li>
                  <DatePresetSelector>Last 3 months</DatePresetSelector>
                </li>
                <li>
                  <DatePresetSelector>Custom</DatePresetSelector>
                </li>
              </ul>
            </div>
            <div
              css={css`
                flex-basis: 70%;

                display: flex;
                flex-direction: column;
                flex-grow: 1;
              `}
            >
              <div
                css={css`
                  display: flex;
                  flex-direction: column;
                  flex-grow: 1;
                `}
              >
                <div>
                  <ul
                    css={css`
                      padding: 0;
                      list-style-type: none;
                      display: flex;
                      flex-direction: row;
                      justify-content: space-evenly;
                    `}
                  >
                    {weekDays.map((weekDay, weekDayIndex) => (
                      <li
                        key={`calendar-header-${weekDayIndex}`}
                        css={css`
                          width: 40px;
                          text-align: center;
                        `}
                      >
                        {/* Month of a year that where monday is the first day */}
                        {format(new Date(2020, 5, weekDay + 1), 'EEE')}
                      </li>
                    ))}
                  </ul>
                </div>
                <div
                  css={css`
                    display: flex;
                    flex-direction: column;
                    flex-grow: 1;
                  `}
                >
                  <ul
                    css={css`
                      flex-grow: 1;
                      list-style-type: none;
                      padding: 0;
                      margin: 0;
                      display: flex;
                      flex-direction: column;
                      justify-content: space-around;
                    `}
                  >
                    {calendarDates.map((calendarDatesRow, rowIndex) => (
                      <li key={`calendar-row-${rowIndex}`}>
                        <ul
                          css={css`
                            list-style-type: none;
                            padding: 0;
                            display: flex;
                            flex-direction: row;
                            justify-content: space-evenly;
                          `}
                        >
                          {calendarDatesRow.map((calendarDate, dateIndex) => (
                            <li
                              key={`calendar-date-${rowIndex}-${dateIndex}`}
                              css={css`
                                height: 40px;
                                width: 40px;
                                flex-grow: 1;
                                text-align: center;
                                background: ${calendarDayBackground(calendarDate)};
                                border-radius: ${calendarDayBorderRadius(calendarDate)};
                              `}
                            >
                              <button
                                css={css`
                                  cursor: pointer;
                                  width: 100%;
                                  height: 100%;
                                  margin: 0;
                                  padding: 0;
                                  border: none;
                                  border-radius: 100%;
                                  background: ${calendarDayColor(calendarDate)};
                                `}
                                onClick={() => handleDayClick(calendarDate)}
                                /* only set hovering date if there is a date selected for better performance */
                                onMouseEnter={() => selectedDate && setHoveringDate(calendarDate)}
                                onMouseLeave={() => hoveringDate && setHoveringDate(null)}
                              >
                                {getDate(calendarDate)}
                              </button>
                            </li>
                          ))}
                        </ul>
                      </li>
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
