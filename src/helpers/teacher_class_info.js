import React from "react";

export default function getDayInfo(data, selectedClass) {
  let dayInfo;
  const timeEditURL = data.site.siteMetadata.timeEdit;

  if (!selectedClass) {
    console.log("No Class Selected, cannot provide class details");
    //return dayInfo;
  }
  const infoForDay = data.dayInfo;
  let details = null;

  if (infoForDay) {

    details = <a href={timeEditURL}>See TimeEdit</a>;
    const info = JSON.parse(infoForDay.dayInfo);
    const infoClass = info[selectedClass];
    if (
      !infoClass ||
      !("teacher" in infoClass) ||
      !("room" in infoClass) ||
      !("time" in infoClass)
    ) {
      console.warn(
        `No info found for class: ${selectedClass}. Is class columns for this class defined in sheet `,
        data.markdownRemark.fields.shortTitle,
        infoClass
      );
      return details;
    }
    const { teacher, room, time } = infoClass;
    if (teacher === null && room === null && time === null) {
      return details;
    } else {
      const _teacher = teacher || <a href={timeEditURL}>See TimeEdit</a>;
      const _room = room || <a href={timeEditURL}>See TimeEdit</a>;
      const _time = time || <a href={timeEditURL}>See TimeEdit</a>;
      details = `Teacher: ${_teacher}, Classroom: ${_room}, Time: ${_time}`;
    }
  }
  return details;
}
