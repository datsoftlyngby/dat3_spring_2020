import React from "react";
import { graphql } from "gatsby";
import Layout, { StyleContext } from "../components/layout";

export default ({ data }) => {
  const post = data.markdownRemark;
  let periodInfoHtml = null;
  let periodTitle = null;
  //CHECK THIS
  if (!post) {
    return;
  }
  periodInfoHtml = post.html;
  periodTitle = post.frontmatter.title;
 
  return (
    <Layout>
      <StyleContext.Consumer>
        {value => (
          <div key={1323232}>
            <div
              className="description-header"
              style={value}
            >
              <h1>{periodTitle}</h1>

              <br />
            </div>
            <div dangerouslySetInnerHTML={{ __html: periodInfoHtml }} />
            {/* {links.length > 0 && (
          <table>
            <tbody>{links}</tbody>
          </table>
        )} */}
          </div>
        )}
      </StyleContext.Consumer>
    </Layout>
  );
};

export const query = graphql`
  query($slug: String!) {
    markdownRemark(fields: { slug: { eq: $slug } }) {
      html
      fields {
        slug
        inFolder
        isIndex
      }
      frontmatter {
        title

        date
        pageintro
        headertext
      }
    }
    allMarkdownRemark {
      nodes {
        html
        frontmatter {
          title

          date
          pageintro
        }
        fields {
          slug
          inFolder
          isIndex
          depth
          isSinglePageDocument
          shortTitle
          parentFolder
        }
      }
    }
  }
`;
