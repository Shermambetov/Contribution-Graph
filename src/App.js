import React from 'react';
import { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';
import {
  format,
  formatDistance,
  formatRelative,
  subDays,
  differenceInCalendarWeeks,
  eachWeekOfInterval,
  subYears,
  endOfWeek,
  eachDayOfInterval,
  startOfDay,
  endOfDay,
  addMonths,
} from 'date-fns';
import { ru } from 'date-fns/locale';

const API = 'https://dpg.gg/test/calendar.json';

const classNamesCss = (inputs) => {
  if (inputs >= 30) {
    return 'excellent';
  }
  if (inputs >= 20) {
    return 'higth';
  }
  if (inputs >= 10) {
    return 'normal';
  }
  if (inputs >= 1) {
    return 'low';
  }
  return '';
};
const descr = [
  { text: '', name: '' },
  { text: '1-9', name: 'low' },
  { text: '10-19', name: 'normal' },
  { text: '20-29', name: 'higth' },
  { text: '30+', name: 'excellent' },
];
const weeksName = ['пн', '', 'ср', '', 'пт', '', ''];

const App = () => {
  const [days, setDays] = useState([]);
  const [month, setMonth] = useState([]);

  function init() {
    axios
      .get(API)
      .then(function (response) {
        const data = response.data;
        const yearDays = realTimeData(data);
        setDays(yearDays);
        const names = monthName();
        setMonth(names);
      })
      .catch(function (error) {
        console.log('Error:', error);
      });
  }
  useEffect(() => {
    init();
  }, []);

  const realTimeData = (data) => {
    const thisYear = new Date();
    const lastYear = subYears(thisYear, 1);
    const weeksColculate = eachWeekOfInterval({ start: lastYear, end: thisYear });

    const lastWeek = weeksColculate[weeksColculate.length - 1];
    const lastWeekYear = lastWeek.getFullYear();
    if (lastWeekYear > thisYear.getFullYear()) {
      weeksColculate.pop();
    }
    // console.log(yearStart);
    // console.log(lastYear);
    // console.log(weeksColculate);

    const groupedDays = [];

    for (let i = 0; i < weeksColculate.length; i++) {
      const weekStart = weeksColculate[i];
      const weekEnd = endOfWeek(weekStart, { weekStartsOn: 6 });

      const daysInWeek = eachDayOfInterval({
        start: startOfDay(weekStart),
        end: endOfDay(weekEnd),
      });

      const days = [];

      for (let j = 0; j < daysInWeek.length; j++) {
        const item = daysInWeek[j];
        console.log(item);
        const formatDay = format(item, 'yyyy-MM-dd');
        const inputs = data[formatDay] || 0;
        const dayObj = { date: item, inputs: inputs };
        days.push(dayObj);
      }

      const weekObj = { week: weekStart, days: days };
      groupedDays.push(weekObj);
    }

    console.log(groupedDays);

    return groupedDays;
  };

  function monthName() {
    const thisMoth = new Date();
    const monthNames = [];
    for (let i = 0; i < 12; i++) {
      const date = addMonths(thisMoth, i);
      const monthName = format(date, 'LLL', { locale: ru });
      const capitalizedMonthName = monthName.charAt(0).toUpperCase() + monthName.slice(1);
      monthNames.push(capitalizedMonthName);
    }
    return monthNames;
  }

  return (
    <div className="App" style={{ fontFamily: 'Inter, sans-serif' }}>
      <span>Contribution Graph.</span>
      <div className="months">
        {month.map((item) => {
          return (
            <span key={item} className="month_name">
              {item}
            </span>
          );
        })}
      </div>
      <div className="activity">
        <div className="days_of_week">
          {weeksName.map((item, index) => {
            return (
              <div key={index} className="day_of_week">
                {item}
              </div>
            );
          })}
        </div>
        {days.map((item, index) => {
          return (
            <div className="weeks" key={index}>
              {item &&
                item.days &&
                item.days.map((day) => {
                  return (
                    <div key={day.date} className={'day ' + classNamesCss(day.inputs)}>
                      <div className="tooltip_text">
                        <span className="tooltip_text-contributions">
                          {day.inputs || 'no'} inputs
                        </span>
                        <br />
                        <span className="tooltip_text-date">
                          {format(day.date, 'EEEE, LLLL d, yyyy', { locale: ru })}
                        </span>
                      </div>
                    </div>
                  );
                })}
            </div>
          );
        })}
      </div>
      <div className="description">
        <div className="description_text">Меньше</div>
        {descr.map((item) => {
          return (
            <div key={item.text} className={'day ' + item.class}>
              <div className="tooltip_text">
                <span className="tooltip_text-contributions">{item.text} contributions</span>
                <br />
              </div>
            </div>
          );
        })}
        <div className="description_text">Больше</div>
      </div>
    </div>
  );
};

export default App;
