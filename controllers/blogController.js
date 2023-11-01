const Blog = require("../models/Blog");
const fs = require("fs");
const { async } = require("q");
const cloudinary = require("cloudinary").v2,
      S3HELPER = require('../service/s3helper'),
      _ = require('underscore');
var L = null;

function blogController(opts){
   L = opts.L || require('pino');
   let self = this;
   self.s3helper = new S3HELPER(opts);
}

blogController.prototype.getAllBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find().populate("owner").sort({ createdAt: -1 });
    res.status(200).json({
      status: "success",
      results: blogs.length,
      data: {
        blogs,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};

blogController.prototype.getBlogById = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.blogId).populate("owner");
    if (!blog) {
      return res.status(404).json({
        status: "fail",
        message: "Blog does not exist",
      });
    }

    res.status(200).json({
      status: "success",
      data: {
        blog,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};

blogController.prototype.createBlog = async (req, res) => {
  let self = this;
  self.s3helper.uploadfile(req.file.path)
  .then(function(){
      res.status(200).json({
        status: "success",
        message: 'image uploaded to s3',
      });
  })
  .catch(function(){
      res.status(500).json({
        status: "fail",
        message: err.message,
      });
  });

  // try {
   // const cloudinaryLink = await cloudinary.uploader.upload(req.file.path);

   

    // const blog = await Blog.create({
    //     ...req.body,
    //     // image: req.file.path.replace(/\\/g, "/"),
    //     image: 'https://assets.myntassets.com/h_720,q_90,w_540/v1/assets/images/23436634/2023/5/27/b70db43a-6a8d-4844-8184-892b1561b6661685128357517WomenLehengaCholi2.jpg',
    //     owner: req.user._id,
    //   });
    //   res.status(200).json({
    //     status: "success",
    //     data: {
    //       blog,
    //     },
    //   });
    // } catch (err) {
    //   res.status(400).json({
    //     status: "fail",
    //     message: err.message,
    //   });
    // }
};

blogController.prototype.updateBlog = async (req, res) => {
  try {
    let updatedBlog;
    if (req.file) {
      const updatingBlog = await Blog.findById(req.params.blogId);
      if (!updatingBlog) {
        return res.status(404).json({
          status: "fail",
          message: "Blog does not exist",
        });
      }
      const imageName = updatingBlog.image
        .split("/")
        .slice(-1)[0]
        .split(".")[0];

      const newImage = await cloudinary.uploader.upload(req.file.path, {
        public_id: imageName,
        invalidate: true,
      });

      // await fs.unlink(`./${updatingBlog.image}`, (err) => {
      //   if (err && err.code == "ENOENT") {
      //     // file doens't exist
      //     console.info("File doesn't exist, won't remove it.");
      //   } else if (err) {
      //     // other errors, e.g. maybe we don't have enough permission
      //     console.error("Error occurred while trying to remove file");
      //   } else {
      //     console.info(`removed`);
      //   }
      // });

      updatedBlog = {
        ...req.body,
        // image: req.file.path.replace(/\\/g, "/"),
        image: newImage.url,
      };
    } else {
      updatedBlog = {
        ...req.body,
      };
    }
    const blog = await Blog.findByIdAndUpdate(req.params.blogId, updatedBlog, {
      new: true,
    });

    res.status(200).json({
      status: "success",
      data: {
        blog,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};

blogController.prototype.deleteBlog = async (req, res) => {
  try {
    const deletingBlog = await Blog.findById(req.params.blogId);
    if (!deletingBlog) {
      return res.status(404).json({
        status: "fail",
        message: "Blog does not exist",
      });
    }
    const imageName = deletingBlog.image.split("/").slice(-1)[0].split(".")[0];
    await cloudinary.uploader.destroy(imageName);

    // await fs.unlink(`./${deletingBlog.image}`, (err) => {
    //   if (err && err.code == "ENOENT") {
    //     // file doens't exist
    //     console.info("File doesn't exist, won't remove it.");
    //   } else if (err) {
    //     // other errors, e.g. maybe we don't have enough permission
    //     console.error("Error occurred while trying to remove file");
    //   } else {
    //     console.info(`removed`);
    //   }
    // });

    deletingBlog.delete();

    res.status(200).json({
      status: "success",
      message: "Blog Successfully Deleted",
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};

blogController.prototype.likeBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.blogId);
    const user = req.user;

    if (!blog) {
      return res.status(404).json({
        status: "fail",
        message: "Blog Does not Exist",
      });
    }

    const blogLikes = [...blog.likes];

    const checkUser = blogLikes.findIndex((likedUserId) =>
      likedUserId.equals(user._id)
    );

    if (checkUser !== -1) {
      return res.status(400).json({
        status: "fail",
        message: "You have already liked this blog",
      });
    }

    blogLikes.push(user._id);

    const likedBlog = await Blog.findByIdAndUpdate(
      req.params.blogId,
      { likes: blogLikes },
      { new: true }
    );

    return res.status(200).json({
      status: "success",
      data: {
        likes: blogLikes.length,
        likedBlog,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};

blogController.prototype.unlikeBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.blogId);
    const user = req.user;

    if (!blog) {
      return res.status(404).json({
        status: "fail",
        message: "Blog Does not Exist",
      });
    }

    if (!blog.likes || !blog.likes.length) {
      return res.status(404).json({
        status: "fail",
        message: "This blog has no likes",
      });
    }

    const blogLikes = [...blog.likes];

    const checkUser = blogLikes.findIndex((likedUserId) =>
      likedUserId.equals(user._id)
    );

    if (checkUser === -1) {
      return res.status(400).json({
        status: "fail",
        message: "You have not liked this blog.",
      });
    }

    blogLikes.splice(checkUser, 1);

    const unlikedBlog = await Blog.findByIdAndUpdate(
      req.params.blogId,
      { likes: blogLikes },
      { new: true }
    );

    return res.status(200).json({
      status: "success",
      data: {
        likes: blogLikes.length,
        unlikedBlog,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};

blogController.prototype.getAllBlogByUser = async (req, res) => {
  try {
    const blogs = await Blog.find({ owner: req.params.userId })
      .populate("owner")
      .sort({ createdAt: -1 });
    res.status(200).json({
      status: "success",
      results: blogs.length,
      data: {
        blogs,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};

module.exports = blogController;