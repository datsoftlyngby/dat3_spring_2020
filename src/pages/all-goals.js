import { graphql } from "gatsby";
import React from "react";
import Layout from "../components/layout";
import {makeUlForGoalsV2} from "../helpers/goalHelper";
//import { getDayInWeekFromDkDate } from "../helpers/date_utils";

import {
  Accordion,
  AccordionItem,
  AccordionItemHeading,
  AccordionItemButton,
  AccordionItemPanel
} from "react-accessible-accordion";

function getRelativePathParts(node){
  const index = node.fileAbsolutePath.indexOf("/pages/")+"/pages/".length;
  const relativePath = node.fileAbsolutePath.substring(index)
  return relativePath.split("/");
}

export default ({ data }) => {
  const allNodes = data.allMarkdownRemark.nodes;
  const nodesWithGoals = allNodes.filter(node=>{ 
    //Relative path is included in order not to include goals from overriden classes
    return (node.frontmatter.goals && node.frontmatter.title !=="SKIP" && getRelativePathParts(node).length===3)
  });
  
  const goals = nodesWithGoals.map(node=> {
    let goal = {};
    goal.goals = node.frontmatter.goals.split("\n");
    goal.title = node.frontmatter.title;
    const pathParts = getRelativePathParts(node);
    goal.date = node.frontmatter.date
    goal.period = pathParts[pathParts.length-3];
    goal.week = pathParts[pathParts.length-2];
    //goal.path = node.fileAbsolutePath
    return goal;
  })

  const periodsObj = {};
  goals.forEach(g=>{
   
    const p = g.period;
    if(!periodsObj[p]){
      let period = {};
      period.title = g.period;
      period.weeks = [];
      periodsObj[p] = {}
      periodsObj[p].period = period;
    }
    periodsObj[p].period.weeks.push(g);
  })
  let periods =[]
  for(var p in periodsObj){
    periods.push(periodsObj[p]);
  }
  periods = periods.sort((a,b) => {
    var first  =  a.period.title.toLowerCase();
    var second =  b.period.title.toLowerCase();
    if(first < second) return -1;
    if(first > second) return 1;
    return 0;
  })
    const accordionItems = [];
  let id = 0;
  periods.forEach(p=> {
    id++;
    const period = p.period;
    const rows = period.weeks.map((g, idx) => (
      <tr key={idx} style={{margin:0,padding:0}}>
        <td style={{width:120,fontSize:10}}>{g.title}</td>
        <td>{makeUlForGoalsV2(g.goals)}</td>
      </tr>
    ));
    const accordionGroup = (
      <AccordionItem key={id}>
        <AccordionItemHeading>
          <AccordionItemButton>{period.title}</AccordionItemButton>
        </AccordionItemHeading>
        <AccordionItemPanel>
          <table>
            <tbody>{rows}</tbody>
          </table>
        </AccordionItemPanel>
      </AccordionItem>
    );
    accordionItems.push(accordionGroup);
  })
    
 
  return (
    <Layout>
      <h2>Learning Goals (Period-1)</h2>
      <p>All learning goals, listed pr. period</p>
      <Accordion allowZeroExpanded={true} >
        {accordionItems}
      </Accordion>
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
          title
          pageintro
          goals
          date
        }
        fileAbsolutePath
      }
    }
  }
`;
