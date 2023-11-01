const express = require("express");
const router = express.Router();
const BLOGCONTROLLER = require("../controllers/blogController");
const { protect, isOwner } = require("../middlewares/authMiddleware");
const multer = require("multer"),
     fs = require("fs");
var L = null;

function blogRoutes(opts){
   L = opts.L || require('pino');
   let self = this;
   self.blogController = new BLOGCONTROLLER(opts);
  
  // @desc    Get all Blogs
  // @route   GET /api/blogs
  // @access  public
  router.get("/", self.blogController.getAllBlogs);


  // @desc    Get Blog by Id
  // @route   GET /api/blogs/:blogId
  // @access  public
  router.get("/:blogId", self.blogController.getBlogById);

  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, '/tmp'); 
    },
    filename: function (req, file, cb) {
      cb(null, new Date().toISOString().replace(/:/g, "-") + file.originalname);
    },
  });

  const fileFilter = (req, file, cb) => {
    if (
      file.mimetype === "image/jpeg" ||
      file.mimetype === "image/png" ||
      file.mimetype === "image/jpg"
    ) {
      cb(null, true);
    } else {
      cb(null, false);
    }
  };

  const upload = multer({
    storage: storage,
    limits: {
      fileSize: 5 * 1024 * 1024,
    },
    fileFilter: fileFilter,
  });

  // @desc    Create a Blog
  // @route   POST /api/blogs
  // @access  private
  router.post("/", protect, upload.single("image"), self.blogController.createBlog);

  // @desc    Update Blog
  // @route   PATCH /api/blogs/:blogId
  // @access  private
  router.patch("/:blogId", protect, isOwner, upload.single("image"), self.blogController.updateBlog);

  // @desc    Delete a Blog
  // @route   DELETE /api/blogs/:blogId
  // @access  private
  router.delete("/:blogId", protect, isOwner, self.blogController.deleteBlog);

  // @desc    Like a Blog
  // @route   POST /api/blogs/like/:blogID
  // @access  private
  router.post("/like/:blogId", protect, self.blogController.likeBlog);

  // @desc    Unlike a Blog
  // @route   POST /api/blogs/unlike/:blogId
  // @access  private
  router.post("/unlike/:blogId", protect, self.blogController.unlikeBlog);

  // @desc    Get all Blogs by a particular User
  // @route   GET /api/blogs/by/:userId
  // @access  public
  router.get("/by/:userId", self.blogController.getAllBlogByUser);

  return router;
}

module.exports = blogRoutes;
