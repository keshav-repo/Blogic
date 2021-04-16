import {
  CREATE_BLOG,
  GET_ALL_BLOGS,
  GET_BLOG,
  GET_BLOGS_BY_USER,
  UPDATE_BLOG,
  DELETE_BLOG,
  BLOG_ERROR,
  CLEAR_BLOG,
} from "../types";

export default (state, action) => {
  switch (action.type) {
    case CREATE_BLOG:
      return {
        ...state,
        blogs: [...state.blogs, action.payload],
        loading: false,
      };
    case GET_BLOG:
      return {
        ...state,
        blog: action.payload,
        loading: false,
      };
    case GET_ALL_BLOGS:
      return {
        ...state,
        blogs: action.payload,
        loading: false,
      };
    case CLEAR_BLOG: {
      return {
        ...state,
        blogs: [],
        blog: null,
        error: null,
      };
    }
    case BLOG_ERROR:
      return {
        ...state,
        error: action.payload,
      };
    default:
      return state;
  }
};