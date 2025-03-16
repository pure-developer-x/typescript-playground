/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { ReactChild } from "react";
import { ObjectInspector, chromeDark } from "react-inspector";

type Props = {
  name?: string;
  data: unknown;
  theme?: string;
};

type CommonProps = {
  name?: string;
  data: unknown;
  isNonenumerable?: boolean;
};
export const unselectable = {
  WebkitTouchCallout: "none",
  WebkitUserSelect: "none",
  KhtmlUserSelect: "none",
  MozUserSelect: "none",
  msUserSelect: "none",
  OUserSelect: "none",
  userSelect: "none",
};

export const PureInspectorTheme = {
  ...chromeDark,
  BASE_FONT_FAMILY: `ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace`,
  BASE_FONT_SIZE: "0.75rem",
  BASE_BACKGROUND_COLOR: "inherit",
  BASE_COLOR: "hsl(var(--primary))",
  BASE_LINE_HEIGHT: "1rem",
  TREENODE_FONT_FAMILY: `ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace`,
  TREENODE_FONT_SIZE: "0.75rem",
  TREENODE_LINE_HEIGHT: "1rem",
  OBJECT_PREVIEW_ARRAY_MAX_PROPERTIES: 10,
  OBJECT_PREVIEW_OBJECT_MAX_PROPERTIES: 4,
  OBJECT_NAME_COLOR: "#9cdcfe",
  OBJECT_VALUE_NULL_COLOR: "rgb(127, 127, 127)",
  OBJECT_VALUE_UNDEFINED_COLOR: "rgb(127, 127, 127)",
  OBJECT_VALUE_REGEXP_COLOR: "#c4704f",
  OBJECT_VALUE_STRING_COLOR: "#c98a7d",
  OBJECT_VALUE_SYMBOL_COLOR: "rgb(233, 63, 59)",
  OBJECT_VALUE_NUMBER_COLOR: "#b5cea8",
  OBJECT_VALUE_BOOLEAN_COLOR: "#569cd6",
  OBJECT_VALUE_FUNCTION_PREFIX_COLOR: "#80a665",
  TABLE_SORT_ICON_COLOR: "hsl(var(--primary))",
  TABLE_BORDER_COLOR: "transparent",
} as unknown as string;

const theme = createTheme(PureInspectorTheme);

export function PureObjectLabel({
  name,
  data,
  isNonenumerable = false,
}: CommonProps) {
  const object = data;

  return (
    <span>
      {typeof name === "string" ? (
        <ObjectName name={name} dimmed={isNonenumerable} />
      ) : (
        <ObjectPreview data={name} />
      )}
      <span>: </span>
      <ObjectPreview data={object} />
    </span>
  );
}

function PureRootLabel({ name, data }: { name: string; data: unknown }) {
  if (typeof name === "string") {
    return (
      <span>
        <ObjectName name={name} className="!text-purple-500 font-semibold" />
        <span>: </span>
        <ObjectPreview data={data} />
      </span>
    );
  } else {
    return <ObjectPreview data={data} />;
  }
}

export const PureNodeRenderer = ({
  depth,
  name,
  data,
  isNonenumerable,
}: {
  depth: number;
  name: string;
  data: unknown;
  isNonenumerable: boolean;
}) => {
  if (depth === 0) {
    return <PureRootLabel name={name} data={data} />;
  }
  return (
    <PureObjectLabel
      name={name}
      data={data}
      isNonenumerable={isNonenumerable}
    />
  );
};

export function PureInspector(props: Props) {
  return (
    <ObjectInspector
      {...props}
      nodeRenderer={PureNodeRenderer}
      theme={PureInspectorTheme}
    ></ObjectInspector>
  );
}

/** From React Library */

/* intersperse arr with separator */
function intersperse(arr: any[], sep: string) {
  if (arr.length === 0) {
    return [];
  }

  return arr.slice(1).reduce((xs, x) => xs.concat([sep, x]), [arr[0]]);
}

export function ObjectName({
  name,
  dimmed = false,
}: {
  name: string;
  dimmed?: boolean;
  className?: string;
}) {
  const themeStyles = theme.ObjectName;
  const appliedStyles = {
    ...themeStyles.base,
    ...(dimmed ? themeStyles["dimmed"] : {}),
  };

  return <span style={appliedStyles}>{name}</span>;
}

/**
 * A short description of the object values.
 * Can be used to render tree node in ObjectInspector
 * or render objects in TableInspector.
 */
export function ObjectValue({ object }: { object: unknown }) {
  const themeStyles = theme.ObjectValue as any;
  const mkStyle = (key: any) => ({ ...themeStyles[key] });

  switch (typeof object) {
    case "bigint":
      return (
        <span style={mkStyle("objectValueNumber")}>{String(object)}n</span>
      );
    case "number":
      return <span style={mkStyle("objectValueNumber")}>{String(object)}</span>;
    case "string":
      return <span style={mkStyle("objectValueString")}>"{object}"</span>;
    case "boolean":
      return (
        <span style={mkStyle("objectValueBoolean")}>{String(object)}</span>
      );
    case "undefined":
      return <span style={mkStyle("objectValueUndefined")}>undefined</span>;
    case "object":
      if (object === null) {
        return <span style={mkStyle("objectValueNull")}>null</span>;
      }
      if (object instanceof Date) {
        return <span>{object.toString()}</span>;
      }
      if (object instanceof RegExp) {
        return (
          <span style={mkStyle("objectValueRegExp")}>{object.toString()}</span>
        );
      }
      if (Array.isArray(object)) {
        return <span>{`Array(${object.length})`}</span>;
      }
      if (!object.constructor) {
        return <span>Object</span>;
      }
      if (
        "isBuffer" in object.constructor &&
        "length" in object &&
        typeof object.constructor?.isBuffer === "function" &&
        object.constructor.isBuffer(object)
      ) {
        return <span>{`Buffer[${object.length}]`}</span>;
      }

      return <span>{object.constructor.name}</span>;
    case "function":
      return (
        <span>
          <span style={mkStyle("objectValueFunctionPrefix")}>ƒ&nbsp;</span>
          <span style={mkStyle("objectValueFunctionName")}>
            {object.name}()
          </span>
        </span>
      );
    case "symbol":
      return (
        <span style={mkStyle("objectValueSymbol")}>{object.toString()}</span>
      );
    default:
      return <span />;
  }
}

/**
 * A preview of the object
 */
export const ObjectPreview = ({ data }: CommonProps) => {
  const object = data;
  const styles = theme.ObjectPreview;

  if (
    typeof object !== "object" ||
    object === null ||
    object instanceof Date ||
    object instanceof RegExp
  ) {
    return <ObjectValue object={object} />;
  }

  if (Array.isArray(object)) {
    const maxProperties = styles.arrayMaxProperties;
    const previewArray = object
      .slice(0, maxProperties)
      .map((element, index) => <ObjectValue key={index} object={element} />);
    if (object.length > maxProperties) {
      previewArray.push(<span key="ellipsis">…</span>);
    }
    const arrayLength = object.length;
    return (
      <React.Fragment>
        <span style={styles.objectDescription}>
          {arrayLength === 0 ? `` : `(${arrayLength})\xa0`}
        </span>
        <span style={styles.preview}>[{intersperse(previewArray, ", ")}]</span>
      </React.Fragment>
    );
  } else {
    const maxProperties = styles.objectMaxProperties;
    const propertyNodes: ReactChild[] = [];
    for (const propertyName in object) {
      if (Object.hasOwnProperty.call(object, propertyName)) {
        let ellipsis;
        if (
          propertyNodes.length === maxProperties - 1 &&
          Object.keys(object).length > maxProperties
        ) {
          ellipsis = <span key={"ellipsis"}>…</span>;
        }

        const propertyValue = getPropertyValue(object, propertyName);
        propertyNodes.push(
          <span key={propertyName}>
            <ObjectName name={propertyName || `""`} />
            :&nbsp;
            <ObjectValue object={propertyValue} />
            {ellipsis}
          </span>
        );
        if (ellipsis) break;
      }
    }

    const objectConstructorName = object.constructor
      ? object.constructor.name
      : "Object";

    return (
      <React.Fragment>
        <span style={styles.objectDescription}>
          {objectConstructorName === "Object"
            ? ""
            : `${objectConstructorName} `}
        </span>
        <span style={styles.preview}>
          {"{"}
          {intersperse(propertyNodes, ", ")}
          {"}"}
        </span>
      </React.Fragment>
    );
  }
};

export function getPropertyValue(object: any, propertyName: PropertyKey) {
  const propertyDescriptor = Object.getOwnPropertyDescriptor(
    object,
    propertyName
  );
  if (propertyDescriptor?.get) {
    try {
      return propertyDescriptor.get();
    } catch {
      return propertyDescriptor.get;
    }
  }

  return object[propertyName];
}

export function createTheme(theme: any) {
  return {
    DOMNodePreview: {
      htmlOpenTag: {
        base: {
          color: theme.HTML_TAG_COLOR,
        },
        tagName: {
          color: theme.HTML_TAGNAME_COLOR,
          textTransform: theme.HTML_TAGNAME_TEXT_TRANSFORM,
        },
        htmlAttributeName: {
          color: theme.HTML_ATTRIBUTE_NAME_COLOR,
        },
        htmlAttributeValue: {
          color: theme.HTML_ATTRIBUTE_VALUE_COLOR,
        },
      },
      htmlCloseTag: {
        base: {
          color: theme.HTML_TAG_COLOR,
        },
        offsetLeft: {
          /* hack: offset placeholder */
          marginLeft: -theme.TREENODE_PADDING_LEFT,
        },
        tagName: {
          color: theme.HTML_TAGNAME_COLOR,
          textTransform: theme.HTML_TAGNAME_TEXT_TRANSFORM,
        },
      },
      htmlComment: {
        color: theme.HTML_COMMENT_COLOR,
      },
      htmlDoctype: {
        color: theme.HTML_DOCTYPE_COLOR,
      },
    },

    ObjectPreview: {
      objectDescription: {
        fontStyle: "italic",
      },
      preview: {
        fontStyle: "italic",
      },
      arrayMaxProperties: theme.OBJECT_PREVIEW_ARRAY_MAX_PROPERTIES,
      objectMaxProperties: theme.OBJECT_PREVIEW_OBJECT_MAX_PROPERTIES,
    },

    ObjectName: {
      base: {
        color: theme.OBJECT_NAME_COLOR,
      },
      dimmed: {
        opacity: 0.6,
      },
    },

    ObjectValue: {
      objectValueNull: {
        color: theme.OBJECT_VALUE_NULL_COLOR,
      },
      objectValueUndefined: {
        color: theme.OBJECT_VALUE_UNDEFINED_COLOR,
      },
      objectValueRegExp: {
        color: theme.OBJECT_VALUE_REGEXP_COLOR,
      },
      objectValueString: {
        color: theme.OBJECT_VALUE_STRING_COLOR,
      },
      objectValueSymbol: {
        color: theme.OBJECT_VALUE_SYMBOL_COLOR,
      },
      objectValueNumber: {
        color: theme.OBJECT_VALUE_NUMBER_COLOR,
      },
      objectValueBoolean: {
        color: theme.OBJECT_VALUE_BOOLEAN_COLOR,
      },
      objectValueFunctionPrefix: {
        color: theme.OBJECT_VALUE_FUNCTION_PREFIX_COLOR,
        fontStyle: "italic",
      },
      objectValueFunctionName: {
        fontStyle: "italic",
      },
    },

    TreeView: {
      treeViewOutline: {
        padding: 0,
        margin: 0,
        listStyleType: "none",
      },
    },

    TreeNode: {
      treeNodeBase: {
        color: theme.BASE_COLOR,
        backgroundColor: theme.BASE_BACKGROUND_COLOR,

        lineHeight: theme.TREENODE_LINE_HEIGHT,
        cursor: "default",

        boxSizing: "border-box",
        listStyle: "none",

        fontFamily: theme.TREENODE_FONT_FAMILY,
        fontSize: theme.TREENODE_FONT_SIZE,
      },
      treeNodePreviewContainer: {},
      treeNodePlaceholder: {
        whiteSpace: "pre",

        fontSize: theme.ARROW_FONT_SIZE,
        marginRight: theme.ARROW_MARGIN_RIGHT,
        ...unselectable,
      },
      treeNodeArrow: {
        base: {
          color: theme.ARROW_COLOR,
          display: "inline-block",
          // lineHeight: '14px',
          fontSize: theme.ARROW_FONT_SIZE,
          marginRight: theme.ARROW_MARGIN_RIGHT,
          ...(parseFloat(theme.ARROW_ANIMATION_DURATION) > 0
            ? {
                transition: `transform ${theme.ARROW_ANIMATION_DURATION} ease 0s`,
              }
            : {}),
          ...unselectable,
        },
        expanded: {
          WebkitTransform: "rotateZ(90deg)",
          MozTransform: "rotateZ(90deg)",
          transform: "rotateZ(90deg)",
        },
        collapsed: {
          WebkitTransform: "rotateZ(0deg)",
          MozTransform: "rotateZ(0deg)",
          transform: "rotateZ(0deg)",
        },
      },
      treeNodeChildNodesContainer: {
        margin: 0, // reset user-agent style
        paddingLeft: theme.TREENODE_PADDING_LEFT,
      },
    },

    TableInspector: {
      base: {
        color: theme.BASE_COLOR,

        position: "relative",
        border: `1px solid ${theme.TABLE_BORDER_COLOR}`,
        fontFamily: theme.BASE_FONT_FAMILY,
        fontSize: theme.BASE_FONT_SIZE,
        lineHeight: "120%",
        boxSizing: "border-box",
        cursor: "default",
      },
    },

    TableInspectorHeaderContainer: {
      base: {
        top: 0,
        height: "17px",
        left: 0,
        right: 0,
        overflowX: "hidden",
      },
      table: {
        tableLayout: "fixed",
        borderSpacing: 0,
        borderCollapse: "separate",
        height: "100%",
        width: "100%",
        margin: 0,
      },
    },

    TableInspectorDataContainer: {
      tr: {
        display: "table-row",
      },
      td: {
        boxSizing: "border-box",
        border: "none", // prevent overrides
        height: "16px", // /* 0.5 * table.background-size height */
        verticalAlign: "top",
        padding: "1px 4px",
        WebkitUserSelect: "text",

        whiteSpace: "nowrap",
        textOverflow: "ellipsis",
        overflow: "hidden",
        lineHeight: "14px",
      },
      div: {
        position: "static",
        top: "17px",
        bottom: 0,
        overflowY: "overlay",
        transform: "translateZ(0)",

        left: 0,
        right: 0,
        overflowX: "hidden",
      },
      table: {
        positon: "static",
        left: 0,
        top: 0,
        right: 0,
        bottom: 0,
        borderTop: "0 none transparent",
        margin: 0, // prevent user agent stylesheet overrides

        backgroundImage: theme.TABLE_DATA_BACKGROUND_IMAGE,
        backgroundSize: theme.TABLE_DATA_BACKGROUND_SIZE,
        tableLayout: "fixed",

        // table
        borderSpacing: 0,
        borderCollapse: "separate",
        // height: '100%',
        width: "100%",

        fontSize: theme.BASE_FONT_SIZE,
        lineHeight: "120%",
      },
    },

    TableInspectorTH: {
      base: {
        position: "relative", // anchor for sort icon container
        height: "auto",
        textAlign: "left",
        backgroundColor: theme.TABLE_TH_BACKGROUND_COLOR,
        borderBottom: `1px solid ${theme.TABLE_BORDER_COLOR}`,
        fontWeight: "normal",
        verticalAlign: "middle",
        padding: "0 4px",

        whiteSpace: "nowrap",
        textOverflow: "ellipsis",
        overflow: "hidden",
        lineHeight: "14px",

        ":hover": {
          backgroundColor: theme.TABLE_TH_HOVER_COLOR,
        },
      },
      div: {
        whiteSpace: "nowrap",
        textOverflow: "ellipsis",
        overflow: "hidden",

        // prevent user agent stylesheet overrides
        fontSize: theme.BASE_FONT_SIZE,
        lineHeight: "120%",
      },
    },

    TableInspectorLeftBorder: {
      none: {
        borderLeft: "none",
      },
      solid: {
        borderLeft: `1px solid ${theme.TABLE_BORDER_COLOR}`,
      },
    },

    TableInspectorSortIcon: {
      display: "block",
      marginRight: 3, // 4,
      width: 8,
      height: 7,

      marginTop: -7,
      color: theme.TABLE_SORT_ICON_COLOR,
      fontSize: 12,
      // lineHeight: 14
      ...unselectable,
    },
  };
}
