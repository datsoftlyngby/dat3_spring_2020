import React from "react";
import Modal from "./Modal";
import logo from "../../images/logo.png";
import offline from "../../images/offline.svg";
//import logo from "../../images/logo.svg"
import { StaticQuery, Link, graphql } from "gatsby";
import { getDateFromDkDate } from "../helpers/date_utils";

import { navigate } from "gatsby";

import "../../images/css/font-awesome.css";
import "../../style.css";
import selectedPages from "../helpers/pagesForMenu";
import Select from "react-select";

// function getFromLocalStorage(id) {
//   return localStorage[`${id}_selectedClass`];
// }
function getFromLocalStorage(id, classes) {
  const className = localStorage[`${id}_selectedClass`];
  const selectedClass = classes.find(class_ => class_.value === className);
  return selectedClass;
}
function setInLocalStorage(value, id) {
  //localStorage[`${id}_selectedClass`] = JSON.stringify(value);
  if (typeof window !== "undefined") {
    localStorage[`${id}_selectedClass`] = value;
  }
}

const StyleContext = React.createContext({});

class Container extends React.Component {
  constructor(props) {
    super(props);
    let selectedClass = null;
    const { idLocalStorage, classes } = this.props.site.siteMetadata;
    if (classes.length === 1) {
      selectedClass = classes[0];
      setInLocalStorage(selectedClass.value, idLocalStorage);
    }
    if (
      selectedClass === null &&
      typeof localStorage !== "undefined" &&
      getFromLocalStorage(idLocalStorage, classes)
    ) {
      //selectedClass = JSON.parse(getFromLocalStorage(idLocalStorage));
      selectedClass = getFromLocalStorage(idLocalStorage, classes);
    }
    //When more than one class, until a class is selecte first clas in list sets the Styles
    const defaultBackground = classes[0].backgroundColor;
    selectedClass = selectedClass ? selectedClass : classes[0]

    let offline = false;
    if (typeof navigator != "undefined") {
      offline = !navigator.onLine;
    }
    //necessary since first time it executes it's done by node and not in a browser
    this.state = { offline, showModal: false, selectedClass, idLocalStorage, defaultBackground };
  }

  componentDidMount() {
    window.addEventListener("click", this.clicked);
    window.addEventListener("online", this.setOffline);
    window.addEventListener("offline", this.setOffline);
    // this.setOffline();
    // if (localStorage.selectedClass) {
    //   const selectedClass = JSON.parse(localStorage.selectedClass);
    //   this.setState({ selectedClass });
    // }
  }
  componentWillUnmount() {
    window.removeEventListener("online", this.setOffline);
    window.removeEventListener("offline", this.setOffline);
    window.removeEventListener("click", this.clicked);
    this.setOffline();
  }

  /* Disable outgoing links when off-line */
  clicked = e => {
    if (this.state.offline && e.target.tagName.toUpperCase() === "A") {
      if (!e.target.getAttribute("href").startsWith("/")) {
        e.preventDefault();
        this.setState({ showModal: true });
        setTimeout(() => this.setState({ showModal: false }), 2000);
      }
    }
  };

  closeModal = () => this.setState({ showModal: false });
  setOffline = () => this.setState({ offline: !navigator.onLine });

  handleClassChange = selectedClass => {
    this.setState({ selectedClass });
    // localStorage.selectedClass = JSON.stringify(selectedClass);
    setInLocalStorage(selectedClass.value, this.state.idLocalStorage);
    //setInLocalStorage(selectedClass, this.state.idLocalStorage);

    //Check whether this can be done via the Router
    navigate(window.location.pathname);
    //console.log(`Option selected:`, selectedClass,window.location.pathname);
  };

  /*
  Find all sub-entries for this node. Include:
     - nodes that represents plain md-files in folder that holds the folder for the 
       menu-entry(node) that was clicked
     - index.md nodes for files that lives a level below the current node 
      (must end as a clickable menu entry to navigate into that folder)
  */
  setSubmenuForThisNodeX = (nodes, menuNode, level) => {
    if (!menuNode.fields.isIndex) {
      return; //menu-entries made from a plain md-file cannot have parents
    }
    const folder = menuNode.fields.inFolder;

    const menuEntries = nodes
      .filter(node => {
        if (node.fields.depth < level) {
          return false;
        }
        const { parentFolder, isIndex, inFolder, shortTitle } = node.fields;
        const isChildWithIndex = folder === parentFolder && isIndex;
        const isMdFileAndInFolder = !isIndex && inFolder === folder;
        const include = isMdFileAndInFolder || isChildWithIndex;

        if (include) {
          node.sortField = getDateFromDkDate(shortTitle)
            //node.sortField = shortTitle
            .toString()
            .toLowerCase();
          //console.log("-->", shortTitle + " - " + node.sortField)
        }

        return include;
      })
      .sort((a, b) => (a.sortField >= b.sortField ? 1 : -1));
    selectedPages.setPages(menuEntries, level);
  };

  render() {

    const data = this.props;
    const nodes = data.allMarkdownRemark.nodes;

    if (typeof window !== "undefined" && selectedPages.isEmpty()) {
      this.setMenuStructureOnReload(nodes, data.file.size);
    }
    //console.log("-LEVEL1---->", selectedPages.getPages("LEVEL1"));
    //console.log("-LEVEL2---->", selectedPages.getPages("LEVEL2"));

    const plt = nodes
      .filter(
        n =>
          n.fields.isIndex && n.fields.depth === 1 && !n.frontmatter.notForMenu
      )
      .sort((a, b) =>
        a.fields.shortTitle.toLowerCase() >= b.fields.shortTitle.toLowerCase()
          ? 1
          : -1
      );
    const subLinksHTML = selectedPages.getPages("LEVEL1").map(n => {
      let shortTitle = n.fields.shortTitle;
      if (n.frontmatter.notForMenu) {
        return <div>&nbsp;</div>;
      }

      if (
        n.frontmatter.decorator &&
        n.frontmatter.decorator.includes("#date#")
      ) {
        shortTitle = n.frontmatter.decorator.replace("#date#", shortTitle);
      }
      return (
        <Link
          key={n.id}
          to={n.fields.slug}
          onClick={() => this.setSubmenuForThisNodeX(nodes, n, 2)}
          activeClassName="active"
          partiallyActive={true}
        >
          {shortTitle}
        </Link>
      );
    });
    const subLinksLevel2HTML = selectedPages.getPages("LEVEL2").map(n => {
      let isSys =
        n.frontmatter.lectureType && n.frontmatter.lectureType === "SYS";
      let shortTitle = n.fields.shortTitle;
      if (
        n.frontmatter.decorator &&
        n.frontmatter.decorator.includes("#date#")
      ) {
        shortTitle = n.frontmatter.decorator.replace("#date#", shortTitle);
      }
      return (
        <Link
          key={n.id}
          to={n.fields.slug}
          onClick={() => this.setSubmenuForThisNodeX(nodes, n, 3)}
          activeClassName="active"
        >
          {shortTitle}
          {isSys && (
            <span style={{ fontSize: 9, backgroundColor: "yellow" }}>
              (SYS)
            </span>
          )}
        </Link>
      );
    });

    const topLinks = data.site.siteMetadata.topMenu.map(l => {
      if (!(l.URL || l.route)) {
        throw new Error(
          "Either a URL or a route must be provided for a topMenu entry"
        );
      }
      return l.URL ? (
        <a key={l.title} href={l.URL} target="_blank" rel="noopener noreferrer">
          {" "}
          {l.title}
        </a>
      ) : (
          <Link
            key={l.title}
            to={l.route}
            onClick={() => selectedPages.resetSubMenus()}
            target="_blank"
            activeClassName="active"
          >
            {" "}
            {l.title}
          </Link>
        );
    });
    let pageLinksLevel1 = plt.map(p => (
      <Link
        key={p.id}
        to={p.fields.slug}
        onClick={() => this.setSubmenuForThisNodeX(nodes, p, 1)}
        activeClassName="active"
        partiallyActive={true}
      >
        {p.fields.shortTitle}
      </Link>
    ));
    const { classes } = data.site.siteMetadata;
    const selected = this.state.selectedClass
      ? this.state.selectedClass.label
      : "";
    const background = this.state.selectedClass
      ? { backgroundColor: this.state.selectedClass.backgroundColor }
      : { backgroundColor: this.state.defaultBackground };

    const title2 =
      classes.length > 1
        ? `${data.site.siteMetadata.title2} - ${selected}`
        : data.site.siteMetadata.title2;

    return (
      <div>
        <div className="header" style={background}>
          <div className="title">
            <img src={logo} alt="Logo" />
            <div style={{ alignSelf: "flex-start", marginLeft: "2em" }}>
              <h1>{data.site.siteMetadata.title1}</h1>
              <p>{title2}</p>
            </div>
          </div>
          <div className="main-links">{topLinks}</div>
        </div>

        <div className="content-frame">
          <div className="period-links">
            {classes.length > 1 && (
              <div style={{ width: 130 }}>
                <Select
                  value={this.state.selectedClass}
                  onChange={this.handleClassChange}
                  options={classes}
                />
              </div>
            )}
            {pageLinksLevel1}
            {/* HACK to ensure icon is preloaded while online*/}
            <img style={{ width: 1 }} src={offline} alt="dummy" />{" "}
            {this.state.offline && (
              <img className="online" src={offline} alt="off-line" />
            )}
          </div>
          <div className="link-days">{subLinksHTML}</div>
          <div className="link-days">{subLinksLevel2HTML}</div>
          <Modal
            key={this.state.showModal}
            header="Off-line"
            body="You are currently off-line"
            show={this.state.showModal}
            onClose={this.closeModal}
          />
          <div>
            <StyleContext.Provider value={background}>
              {this.props.children}
            </StyleContext.Provider>
          </div>
        </div>
      </div>
    );
  }

  /**
   * set selectedPages if they are empty, which happens if page is refreshed or we started
   * from a bookmarklink
   * @param {*} nodes
   */
  setMenuStructureOnReload(nodes, sizeOfNews) {
    try {
      const newsId = `${this.state.idLocalStorage}_lastNewsSize`;
      if (localStorage[newsId]) {
        const oldSize = Number(localStorage[newsId]);
        const currentSize = sizeOfNews;
        localStorage[newsId] = currentSize;
        if (oldSize !== currentSize) {
          navigate("/news");
        }
      } else {
        const currentSize = sizeOfNews;
        localStorage[newsId] = currentSize;
        navigate("/news");
      }
    } catch (err) { }

    //path should look like this "/aaaa/..."
    const parts = window.location.pathname.split("/");
    if (parts.length > 5) {
      console.error(
        "This is a problem, path should not be longer than 3 as in '/flow1/week2/day"
      );
      return;
    }
    if (parts.length >= 3) {
      const topMenuSlug = `/${parts[1]}/`;
      const topMenuNode = nodes.find(
        n => n.fields.slug === topMenuSlug && n.fields.isIndex
      );
      if (topMenuNode && parts.length >= 3) {
        this.setSubmenuForThisNodeX(nodes, topMenuNode, 1);
      }
      if (topMenuNode && parts.length >= 4) {
        const midLevelNodeSlug = `/${parts[1]}/${parts[2]}/`;
        const midMenuNode = nodes.find(
          n => n.fields.slug === midLevelNodeSlug && n.fields.isIndex
        );
        this.setSubmenuForThisNodeX(nodes, midMenuNode, 2);
      }
    }
  }
}

const outer = ({ children }) => (
  <StaticQuery
    query={query}
    render={data => <Container {...data} children={children} />}
  />
);
export { outer as default, StyleContext }
// export default ({ children }) => (
//   <StaticQuery
//     query={query}
//     render={data => <Container {...data} children={children} />}
//   />
// );

var query = graphql`
  {
    allMarkdownRemark {
      nodes {
        id
        frontmatter {
          date
          lectureType
          notForMenu
          decorator
        }

        fields {
          slug
          inFolder
          isIndex
          depth
          shortTitle
          parentFolder
        }
      }
    }
    site {
      siteMetadata {
        title1
        title2
        idLocalStorage
        classes {
          value
          label
          backgroundColor
        }
        topMenu {
          title
          URL
          route
          include
        }
      }
    }

    file(relativePath: { eq: "pages/news/index.md" }) {
      absolutePath
      size
      prettySize
    }
  }
`;
