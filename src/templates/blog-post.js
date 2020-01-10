import React from "react";
import { graphql } from "gatsby";
import Layout from "../components/layout";
import { StyleContext } from "../components/layout";
//import all from "../helpers/periodLinks";
import "../../style.css";
import { getOverridenPageInfo } from "../helpers/node-helper";
import { makeUlForGoalsV2 } from "../helpers/goalHelper";
import getDayInfo from "../helpers/teacher_class_info";

//To Style (add line breaks) frontmatter
// Uses example from here: https://github.com/gatsbyjs/gatsby/issues/5021
import remark from "remark";
import recommended from "remark-preset-lint-recommended";
import remarkHtml from "remark-html";

/*
TBD Copied from Layout.js --> Refactor both versions into one 
 */
function getFromLocalStorage(id, classes) {
  const className = localStorage[`${id}_selectedClass`];
  const selectedClass = classes.find(class_ => class_.value === className);
  return selectedClass;
}

export default ({ data }) => {
  const post = data.markdownRemark;
  const { idLocalStorage, classes } = data.site.siteMetadata;
  let learningGoal;

  if (post && post.frontmatter.goals) {
    try {
      learningGoal = post.frontmatter.goals.split("\n");
    } catch (e) { }
  }
  let dayInfo = null;
  let title = post.fields.title;
  let periodInfoHtml = null;
  let periodTitle = null;
  const nodes = data.allMarkdownRemark.nodes;
  let replacementHTML = null;

  if (typeof window !== `undefined`) {
    // const selectedClass = localStorage.selectedClass
    //   ? JSON.parse(localStorage.selectedClass).value
    //   : null;
    const selectedClass = getFromLocalStorage(idLocalStorage, classes).value;
    dayInfo = getDayInfo(data, selectedClass);


    const folder = data.markdownRemark.fields.inFolder;
    const fileName = data.markdownRemark.fields.fileName.base;
    replacementHTML = getOverridenPageInfo(
      nodes,
      selectedClass,
      folder,
      fileName
    );
  }

  if (data.site.siteMetadata.showWeekInfoForEachDayInWeek) {
    nodes.forEach(node => {
      if (
        node.fields.isIndex &&
        node.fields.inFolder === post.fields.inFolder
      ) {
        periodTitle = node.fields.title;
        periodInfoHtml = node.html;
      }
    });
  }

  const pageInfo = post.frontmatter.pageintro
    ? remark()
      .use(recommended)
      .use(remarkHtml)
      .processSync(post.frontmatter.pageintro)
      .toString()
    : "";
  const goals = learningGoal ? (
    <React.Fragment>
      <h3 style={{ color: "#295683", marginTop: 0 }}>
        After this day you are expected to :
      </h3>
      {makeUlForGoalsV2(learningGoal)}
    </React.Fragment>
  ) : (
      ""
    );

  return (
    <Layout>
      <StyleContext.Consumer>
        {value => (
          <div key={83246366}>
            {periodInfoHtml && (
              <div className="period-info" style={value}>
                <h3>{periodTitle}</h3>
                <div dangerouslySetInnerHTML={{ __html: periodInfoHtml }} />
              </div>
            )}
            <h2 style={{ color: "#295683" }}>{title}</h2>
            <div
              style={{ fontStyle: "italic", padding: 2, color: "darkgreen" }}
              dangerouslySetInnerHTML={{ __html: pageInfo }}
            />
            <div> {goals}</div>
            <div>
              {" "}
              {dayInfo && (
                <h3>
                  Teacher/room/time:{" "}
                  <span style={{ fontSize: "smaller", color: "darkGray" }}>
                    {dayInfo}
                  </span>
                </h3>
              )}
            </div>
            <hr />
            <div
              dangerouslySetInnerHTML={{ __html: replacementHTML || post.html }}
            />
          </div>
        )}
      </StyleContext.Consumer>
    </Layout>
  );
};

/*
OLD way of fetching goals from the external google-sheet
 learningGoal(day: { eq: $shortTitle }) {
      id
      day
      week
      period
      goals
    }
*/
export const query = graphql`
  query($slug: String!, $shortTitle: String!) {
    dayInfo(day: { eq: $shortTitle }) {
      id
      day
      week
      period
      dayInfo
    }

    allDayInfo {
      nodes {
        id
        week
        period
        day
        dayInfo
      }
    }

    site {
      siteMetadata {
        timeEdit
        showWeekInfoForEachDayInWeek
        idLocalStorage
        classes {
          value
          label
          backgroundColor
        }
      }
    }

    markdownRemark(fields: { slug: { eq: $slug } }) {
      html
      fields {
        slug
        shortTitle
        inFolder
        title
        fileName {
          base
        }
      }
      frontmatter {
        pageintro
        headertext
        goals
      }
    }
    allMarkdownRemark {
      nodes {
        html
        frontmatter {
          pageintro
        }
        fields {
          slug
          inFolder
          title
          isIndex
          fileName {
            relativePath
            base
          }
        }
      }
    }
  }
`;
