import React from "react";
import { graphql } from "gatsby";
import { css } from "react-emotion";
import Layout from "../components/layout";
import {
  getDayInWeekFromDkDate
} from "../helpers/date_utils";

export default ({ data }) => {  
  const allNodes = data.allMarkdownRemark.nodes;
  //Get an Object with periods as keys
  let periods =allNodes.filter(
    node => node.fields.depth === 1
  ).reduce((acc, current) => {
    if(!acc){
      acc = {}
    }
    acc[current.fields.inFolder] = {period:current.fields.shortTitle,weeks: []};
    return acc;
  }, {});
  
  const daysAndWeeks = allNodes.filter(node => node.fields.depth > 1);
  //Add weeks to periods
  daysAndWeeks.forEach(node=>{
    const root = node.fields.inFolder.split("/")[0];
    if(node.fields.isIndex && periods.hasOwnProperty(root)){
      periods[root].weeks.push({shortTitle: node.fields.shortTitle,id:root+node.id,inFolder:node.fields.inFolder,days: []})
    }
  })
  //Add days to corresponding weeks
  daysAndWeeks.forEach(node => {
    const root = node.fields.inFolder.split("/")[0];
    if(periods.hasOwnProperty(root) && node.fields.depth === 2 && !node.fields.isIndex){
      periods[root].weeks.forEach(week => {
        if(node.fields.inFolder.startsWith(week.inFolder)){
          const dayInWeek = getDayInWeekFromDkDate(node.fields.shortTitle);
          const linkText = node.fields.shortTitle + (dayInWeek ? ` (${dayInWeek})` : "");
          week.days.push({slug:node.fields.slug,
                          linkText,
                          id:node.id,
                          pageintro:(node.frontmatter.title || "")})
        }
      })
    }
  })
  //Sort weeks and days
  for(let period in periods){
    periods[period].weeks = periods[period].weeks.sort((a,b) => a.shortTitle >= b.shortTitle? 1 : -1)
    periods[period].weeks.forEach(week => {
      week.days = week.days.sort((a,b) => a.shortTitle >= b.shortTitle? 1 : -1);
    })
  }

  const periodHeaderStyle = {borderBottom:"1px solid",display:"block",fontSize:"x-large",color:"steelBlue"}
  const weekHeaderStyle = {...periodHeaderStyle,fontSize:"large",fontWeight:"bold",borderBottom:"none",marginTop:6}
  
  //Fields in JavaScript Object are not ordered. Get at list of the Keys and Sort that list
  let keys = [];
  let key;
  for (key in periods) {
    if (periods.hasOwnProperty(key)) {
      keys.push(key);
    }
  }
  keys.sort();
  const html = [];
  //Populate html, with Periods, Weeks and links to days
  keys.forEach(key => {
    html.push(
      <p key={key} style={periodHeaderStyle}>
        {periods[key].period}
      </p>
    );
    periods[key].weeks.forEach(week => {
      html.push(
        <p key={week.id} style={weekHeaderStyle}>
          {week.shortTitle}
        </p>
      );
      week.days.forEach(day => {
        html.push(
          <p key={day.id} className="ellipsis">
            <a href={day.slug}> {day.linkText}</a>{" "}
            <span style={{ fontStyle: "italic" }}>{day.pageintro}</span>{" "}
          </p>
        );
      });
    });
  });
  
  return (
    <Layout>
      <div>
        <h1
          className={css`
            display: inline-block;
            border-bottom: 1px solid;
            margin: 0px;
            color: #295683;
          `}
        >
          Full Semester Schedule
        </h1>
        <p style={{ marginTop: 8, fontStyle: "italic" }}>
          Don't count 100% on information more than a week into the future,
          since content most likely will change.
        </p>
        {html}
      </div>
    </Layout>
  );
};

export const query = graphql`
  query {
    allMarkdownRemark(sort: { fields: [frontmatter___date], order: DESC }) {
      totalCount
      nodes {
        id
        frontmatter {
          pageintro
          title
        }
        fields {
          slug
          shortTitle
          depth
          inFolder
          isIndex
        }
      }
    }
  }
`;
