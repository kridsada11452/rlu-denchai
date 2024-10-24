const AVAILABLE_WEEK_DAYS = [
  "อา",
  "จ",
  "อ",
  "พ",
  "พฤ",
  "ศ",
  "ส",
];
const localStorageName = "calendar-events";
const eventData = {
  "1/9/2024": ["กิจกรรมที่ 1: ออกหน่วย พอ.สว. บ้านดงสุระ", "กิจกรรมที่ 2: ออกหน่วย พอ.สว.เด่นชัย"],
  
  "15/9/2024": ["กิจกรรมที่ 1: Deadline for project submission"],
  // Add more events as needed
};

class CALENDAR {
  constructor(options) {
    this.options = options;
    this.elements = {
      days: this.getFirstElementInsideIdByClassName("calendar-days"),
      week: this.getFirstElementInsideIdByClassName("calendar-week"),
      month: this.getFirstElementInsideIdByClassName("calendar-month"),
      year: this.getFirstElementInsideIdByClassName("calendar-current-year"),
      eventList: this.getFirstElementInsideIdByClassName("current-day-events-list"),
      currentDay: this.getFirstElementInsideIdByClassName("calendar-left-side-day"),
      currentWeekDay: this.getFirstElementInsideIdByClassName("calendar-left-side-day-of-week"),
      prevYear: this.getFirstElementInsideIdByClassName("calendar-change-year-slider-prev"),
      nextYear: this.getFirstElementInsideIdByClassName("calendar-change-year-slider-next"),
    };

    // Load events from localStorage and merge them with eventData
    this.eventList = { ...eventData, ...JSON.parse(localStorage.getItem(localStorageName)) };

    this.date = +new Date();
    this.options.maxDays = 37;
    this.init();
  }

  // Rest of the methods...


  // App methods
  init() {
    if (!this.options.id) return false;
    this.eventsTrigger();
    this.drawAll();
  }

  // draw Methods
  drawAll() {
    this.drawWeekDays();
    this.drawMonths();
    this.drawDays();
    this.drawYearAndCurrentDay();
    this.drawEvents();
    this.drawEventCards(); // Call this method to display the cards
}

  drawEventCards() {
    const eventCardsContainer = document.getElementById("event-cards-container");
    eventCardsContainer.innerHTML = ""; // Clear previous content
    
    // Iterate over eventData to display events as cards
    Object.keys(eventData).forEach(date => {
        let eventList = eventData[date];
        
        // Create a card for each date with events
        let cardTemplate = `
            <div class="card mb-3">
                <div class="card-header">
                    วันที่: ${date}
                </div>
                <div class="card-body">
                    <ul>
                        ${eventList.map(event => `<li>${event}</li>`).join('')}
                    </ul>
                </div>
            </div>
        `;
        
        // Append the card to the event container
        eventCardsContainer.innerHTML += cardTemplate;
    });
}


  drawEvents() {
    let calendar = this.getCalendar();
    let formattedDate = calendar.active.formatted;
    
    // Use predefined eventData or fallback to eventList
    let eventList = eventData[formattedDate] || this.eventList[formattedDate] || ["ยังไม่มีกิจกรรม"];
  
    let eventTemplate = "";
    eventList.forEach((item) => {
      eventTemplate += `<li>${item}</li>`;
    });
  
    this.elements.eventList.innerHTML = eventTemplate;
  }
  
  drawYearAndCurrentDay() {
    let calendar = this.getCalendar();
    this.elements.year.innerHTML = calendar.active.year;
    this.elements.currentDay.innerHTML = calendar.active.day;
    this.elements.currentWeekDay.innerHTML =
      AVAILABLE_WEEK_DAYS[calendar.active.week];
  }

  drawDays() {
    let calendar = this.getCalendar();

    let latestDaysInPrevMonth = this.range(calendar.active.startWeek)
      .map((day, idx) => {
        return {
          dayNumber: this.countOfDaysInMonth(calendar.pMonth) - idx,
          month: new Date(calendar.pMonth).getMonth(),
          year: new Date(calendar.pMonth).getFullYear(),
          currentMonth: false,
        };
      })
      .reverse();

    let daysInActiveMonth = this.range(calendar.active.days).map((day, idx) => {
      let dayNumber = idx + 1;
      let today = new Date();
      return {
        dayNumber,
        today:
          today.getDate() === dayNumber &&
          today.getFullYear() === calendar.active.year &&
          today.getMonth() === calendar.active.month,
        month: calendar.active.month,
        year: calendar.active.year,
        selected: calendar.active.day === dayNumber,
        currentMonth: true,
      };
    });

    let countOfDays =
      this.options.maxDays -
      (latestDaysInPrevMonth.length + daysInActiveMonth.length);
    let daysInNextMonth = this.range(countOfDays).map((day, idx) => {
      return {
        dayNumber: idx + 1,
        month: new Date(calendar.nMonth).getMonth(),
        year: new Date(calendar.nMonth).getFullYear(),
        currentMonth: false,
      };
    });

    let days = [
      ...latestDaysInPrevMonth,
      ...daysInActiveMonth,
      ...daysInNextMonth,
    ];

    days = days.map((day) => {
      let newDayParams = day;
      let formatted = this.getFormattedDate(
        new Date(`${Number(day.month) + 1}/${day.dayNumber}/${day.year}`)
      );
      newDayParams.hasEvent = this.eventList[formatted];
      return newDayParams;
    });

    let daysTemplate = "";
    days.forEach((day) => {
      daysTemplate += `<li class="${day.currentMonth ? "" : "another-month"}${
        day.today ? " active-day " : ""
      }${day.selected ? "selected-day" : ""}${
        day.hasEvent ? " event-day" : ""
      }" data-day="${day.dayNumber}" data-month="${day.month}" data-year="${
        day.year
      }"></li>`;
    });

    this.elements.days.innerHTML = daysTemplate;
  }

  drawMonths() {
    let availableMonths = [
      "ม.ค.",
      "ก.พ.",
      "มี.ค.",
      "เม.ย.",
      "พ.ค.",
      "มิ.ย.",
      "ก.ค.",
      "ส.ค.",
      "ก.ย.",
      "ต.ค.",
      "พ.ย.",
      "ธ.ค.",
    ];
    let monthTemplate = "";
    let calendar = this.getCalendar();
    availableMonths.forEach((month, idx) => {
      monthTemplate += `<li class="${
        idx === calendar.active.month ? "active" : ""
      }" data-month="${idx}">${month}</li>`;
    });

    this.elements.month.innerHTML = monthTemplate;
  }

  drawWeekDays() {
    let weekTemplate = "";
    AVAILABLE_WEEK_DAYS.forEach((week) => {
      weekTemplate += `<li>${week.slice(0, 3)}</li>`;
    });

    this.elements.week.innerHTML = weekTemplate;
  }

  // Service methods
  eventsTrigger() {
    this.elements.prevYear.addEventListener("click", (e) => {
      let calendar = this.getCalendar();
      this.updateTime(calendar.pYear);
      this.drawAll();
    });
  
    this.elements.nextYear.addEventListener("click", (e) => {
      let calendar = this.getCalendar();
      this.updateTime(calendar.nYear);
      this.drawAll();
    });
  
    this.elements.month.addEventListener("click", (e) => {
      let calendar = this.getCalendar();
      let month = e.srcElement.getAttribute("data-month");
      if (!month || calendar.active.month == month) return false;
  
      let newMonth = new Date(calendar.active.tm).setMonth(month);
      this.updateTime(newMonth);
      this.drawAll();
    });
  
    this.elements.days.addEventListener("click", (e) => {
      let element = e.srcElement;
      let day = element.getAttribute("data-day");
      let month = element.getAttribute("data-month");
      let year = element.getAttribute("data-year");
      if (!day) return false;
      let strDate = `${Number(month) + 1}/${day}/${year}`;
      this.updateTime(strDate);
      this.drawAll();
    });
  
    // ลบฟังก์ชันนี้เนื่องจากไม่มีการเพิ่มเหตุการณ์
    // this.elements.eventAddBtn.addEventListener("click", (e) => {
    //   let fieldValue = this.elements.eventField.value;
    //   if (!fieldValue) return false;
    //   let dateFormatted = this.getFormattedDate(new Date(this.date));
    //   if (!this.eventList[dateFormatted]) this.eventList[dateFormatted] = [];
    //   this.eventList[dateFormatted].push(fieldValue);
    //   localStorage.setItem(localStorageName, JSON.stringify(this.eventList));
    //   this.elements.eventField.value = "";
    //   this.drawAll();
    // });
  }
  
  getFormattedDate(date) {
    // Add 1 to the month so it matches the format in eventData
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
  }
  

  updateTime(time) {
    this.date = +new Date(time);
  }

  getCalendar() {
    let time = new Date(this.date);

    return {
      active: {
        days: this.countOfDaysInMonth(time),
        startWeek: this.getStartedDayOfWeekByTime(time),
        day: time.getDate(),
        week: time.getDay(),
        month: time.getMonth(),
        year: time.getFullYear(),
        formatted: this.getFormattedDate(time),
        tm: +time,
      },
      pMonth: new Date(time.getFullYear(), time.getMonth() - 1, 1),
      nMonth: new Date(time.getFullYear(), time.getMonth() + 1, 1),
      pYear: new Date(new Date(time).getFullYear() - 1, 0, 1),
      nYear: new Date(new Date(time).getFullYear() + 1, 0, 1),
    };
  }

  countOfDaysInMonth(time) {
    let date = this.getMonthAndYear(time);
    return new Date(date.year, date.month + 1, 0).getDate();
  }

  getStartedDayOfWeekByTime(time) {
    let date = this.getMonthAndYear(time);
    return new Date(date.year, date.month, 1).getDay();
  }

  getMonthAndYear(time) {
    let date = new Date(time);
    return {
      year: date.getFullYear(),
      month: date.getMonth(),
    };
  }

  getFormattedDate(date) {
    return `${date.getDate()}/${date.getMonth()}/${date.getFullYear()}`;
  }

  range(number) {
    return new Array(number).fill().map((e, i) => i);
  }

  getFirstElementInsideIdByClassName(className) {
    return document
      .getElementById(this.options.id)
      .getElementsByClassName(className)[0];
  }
}

(function () {
  new CALENDAR({
    id: "calendar",
  });
})();
