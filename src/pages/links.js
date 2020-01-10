import { graphql } from "gatsby";
import LinkCollector, {
  LinkCollectorFromFrontMatter
} from "../helpers/linkCollector";
import React from "react";
import Layout from "../components/layout";
import {
  Accordion,
  AccordionItem,
  AccordionItemHeading,
  AccordionItemButton,
  AccordionItemPanel
} from "react-accessible-accordion";

export default class Links extends React.Component {
  constructor(props) {
    super(props);
    this.state = { showSlidesDay: false, showExamPrepDay: false };
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(evt) {
    const target = evt.target;
    if (target.id === "showSlidesDay") {
      this.setState({ showSlidesDay: target.checked });
    }
  }

  render() {
    const data = this.props.data;
    const linksFromSettings = data.site.siteMetadata.topMenu.find(
      d => d.title === "Links"
    );
    const toInclude = linksFromSettings.include;
    return (
      <Layout>
        <h2>
          Collection of references used throughout the semester{" "}
          <span style={{ fontSize: "small" }}>
            <label>
              Show (last) day used: &nbsp;
              <input
                id="showSlidesDay"
                type="checkbox"
                onChange={this.handleChange}
                checked={this.state.showSlidesDay}
              />
            </label>
          </span>
        </h2>
        <Accordion allowZeroExpanded={true} allowMultipleExpanded={true}>
          {toInclude.includes("guidelines") && (
            <AccordionItem>
              <AccordionItemHeading>
                <AccordionItemButton>
                  Guidelines used throughout the semester
                </AccordionItemButton>
              </AccordionItemHeading>
              <AccordionItemPanel>
                <LinkCollector
                  data={data}
                  tag="guides"
                  removeDuplicates={true}
                  render={links => (
                    <table>
                      <tbody>
                        {links.map(d => {
                          const html = d.htmlLinks
                            .map(l => l.html)
                            .join("<br/>");
                          return (
                            <tr key={d.id}>
                              {this.state.showSlidesDay && (
                                <td style={{ width: "40%" }}>{d.title}</td>
                              )}
                              <td dangerouslySetInnerHTML={{ __html: html }} />
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                />
              </AccordionItemPanel>
            </AccordionItem>
          )}
          {toInclude.includes("readings") && (
            <AccordionItem>
              <AccordionItemHeading>
                <AccordionItemButton>
                  All Read/Watch-references given this semester
                </AccordionItemButton>
              </AccordionItemHeading>
              <AccordionItemPanel>
                <LinkCollector
                  data={data}
                  tag="readings"
                  removeDuplicates={true}
                  render={allLinks => (
                    <table>
                      <tbody>
                        {allLinks.map(d => {
                          const html = d.htmlLinks
                            .map(l => l.html)
                            .join("<br/>");
                          return (
                            <tr key={d.id}>
                              <td>{d.title}</td>
                              <td dangerouslySetInnerHTML={{ __html: html }} />
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                />
              </AccordionItemPanel>
            </AccordionItem>
          )}
          {toInclude.includes("exercises") && (
            <AccordionItem>
              <AccordionItemHeading>
                <AccordionItemButton>
                  All Exercises given this semester
                </AccordionItemButton>
              </AccordionItemHeading>
              <AccordionItemPanel>
                <LinkCollector
                  data={data}
                  tag="exercises"
                  removeDuplicates={true}
                  render={allLinks => (
                    <table>
                      <tbody>
                        {allLinks.map(d => {
                          const html = d.htmlLinks
                            .map(l => l.html)
                            .join("<br/>");
                          return (
                            <tr key={d.id}>
                              <td>{d.title}</td>
                              <td dangerouslySetInnerHTML={{ __html: html }} />
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                />
              </AccordionItemPanel>
            </AccordionItem>
          )}

{toInclude.includes("admin") &&
<AccordionItem>
            <AccordionItemHeading>
              <AccordionItemButton>
                Administrative (Groups, Review-groups etc.)
              </AccordionItemButton>
            </AccordionItemHeading>
            <AccordionItemPanel>
              <LinkCollector
                data={data}
                tag="admin"
                removeDuplicates={true}
                render={links => (
                  <table>
                    <tbody>
                      {links.map(d => {
                        const html = d.htmlLinks.map(l => l.html).join("<br/>");
                        return (
                          <tr key={d.id}>
                            {this.state.showSlidesDay && (
                              <td style={{ width: "40%" }}>{d.title}</td>
                            )}
                            <td dangerouslySetInnerHTML={{ __html: html }} />
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              />
            </AccordionItemPanel>
          </AccordionItem>}
          {toInclude.includes("examprep") &&
          <AccordionItem>
            <AccordionItemHeading>
              <AccordionItemButton>
                List of Exam Preparation Exercises
              </AccordionItemButton>
            </AccordionItemHeading>
            <AccordionItemPanel>
              <LinkCollector
                data={data}
                tag="exam-prep"
                removeDuplicates={true}
                render={links => (
                  <table>
                    <tbody>
                      {links.map(d => {
                        const html = d.htmlLinks.map(l => l.html).join("<br/>");
                        return (
                          <tr key={d.id}>
                            {this.state.showSlidesDay && (
                              <td style={{ width: "40%" }}>{d.title}</td>
                            )}
                            <td dangerouslySetInnerHTML={{ __html: html }} />
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              />
            </AccordionItemPanel>
          </AccordionItem>}

          {toInclude.includes("studypointex") &&
          <AccordionItem>
            <AccordionItemHeading>
              <AccordionItemButton>
                List of studypoint exercises (friday exercises) given throughout
                the semester
              </AccordionItemButton>
            </AccordionItemHeading>
            <AccordionItemPanel>
              <LinkCollectorFromFrontMatter
                data={data}
                prop="isSP"
                removeDuplicates={true}
                render={allLinks => (
                  <table>
                    <tbody>
                      {allLinks.map(d => {
                        const html = d.htmlLinks.map(l => l.html).join(" | ");
                        return (
                          <tr key={d.id}>
                            {this.state.showSlidesDay && (
                              <td style={{ width: "40%" }}>{d.title}</td>
                            )}
                            <td dangerouslySetInnerHTML={{ __html: html }} />
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              />
            </AccordionItemPanel>
          </AccordionItem>}
          
          {toInclude.includes("ca") &&
          <AccordionItem>
            <AccordionItemHeading>
              <AccordionItemButton>
                List of CA's (Course Assignments)
              </AccordionItemButton>
            </AccordionItemHeading>
            <AccordionItemPanel>
              <LinkCollector
                data={data}
                tag="ca"
                removeDuplicates={true}
                render={links => {
                  return (
                    <ul>
                      {links.map(d => {
                        const html = d.htmlLinks.map(l => l.html).join(" | ");
                        return (
                          <li
                            key={d.id}
                            dangerouslySetInnerHTML={{ __html: html }}
                          />
                        );
                      })}
                    </ul>
                  );
                }}
              />
            </AccordionItemPanel>
          </AccordionItem>}
          {toInclude.includes("slides") &&
          <AccordionItem>
            <AccordionItemHeading>
              <AccordionItemButton>
                List of Slides used throughout the semester &nbsp;
              </AccordionItemButton>
            </AccordionItemHeading>
            <AccordionItemPanel>
              <LinkCollector
                data={data}
                tag="slides"
                useLineBreaks={true}
                removeDuplicates={true}
                render={links => (
                  <table>
                    <tbody>
                      {links.map(d => {
                        const html = d.htmlLinks.map(l => l.html).join("</br>");
                        return (
                          <tr key={d.id}>
                            {this.state.showSlidesDay && <td>{d.title}</td>}
                            <td dangerouslySetInnerHTML={{ __html: html }} />
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              />
            </AccordionItemPanel>
          </AccordionItem>}
        </Accordion> 
      </Layout>
    );
  }
}

export const query = graphql`
  query {
    allMarkdownRemark {
      totalCount
      nodes {
        id
        rawMarkdownBody
        frontmatter {
          title
          pageintro
          isSP
        }
        fields {
          slug
          title
          shortTitle
          depth
          inFolder
          title
          fileName {
            relativePath
            base
          }
        }
      }
    }
    site {
      siteMetadata {
        topMenu {
          title
          URL
          route
          include
        }
      }
    }
  }
`;
