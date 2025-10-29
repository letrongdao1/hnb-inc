/* eslint-disable import/no-anonymous-default-export */
export default {
  control: {
    fontSize: 16,
    backgroundColor: "transparent",
  },

  "&multiLine": {
    control: {
      minHeight: 60,
    },
    highlighter: {
      padding: 9,
      border: "1px solid transparent",
    },
    input: {
      padding: 9,
      border: "1px solid silver",
    },
  },

  "&singleLine": {
    display: "inline-block",
    width: 180,

    highlighter: {
      padding: 1,
      border: "2px inset transparent",
    },
    input: {
      padding: 1,
      border: "2px inset",
    },
  },

  suggestions: {
    list: {
      border: "1px solid rgba(0,0,0,0.15)",
      fontSize: 16,
      zIndex: 9999,
      color: "#333",
      fontFamily: "Montserrat, sans-serif",
    },
    item: {
      padding: "5px 15px",
      borderBottom: "1px solid rgba(0,0,0,0.15)",
      "&focused": {
        backgroundColor: "#444",
        color: "#fff",
      },
      zIndex: 50,
    },
  },
};
