import React, { useCallback, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button, Input, RTE, Select } from "..";
import appwriteService from "../../appwrite/config";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

export default function PostForm({ post }) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    getValues,
    formState: { errors },
  } = useForm({
    defaultValues: {
      title: post?.title || "",
      slug: post?.$id || "",
      content: post?.content || "",
      status: post?.status || "active",
    },
  });

  const navigate = useNavigate();
  const userData = useSelector((state) => state.auth.userData);

  const submit = async (data) => {
    try {
      let fileId = post?.featuredImage || null;

      if (data.image && data.image.length > 0) {
        // Upload new file
        const file = await appwriteService.uploadFile(data.image[0]);

        if (!file) {
          alert("Image upload failed.");
          return;
        }

        fileId = file.$id;

        // Delete old file only if updating
        if (post?.featuredImage) {
          await appwriteService.deleteFile(post.featuredImage);
        }
      }

      if (post) {
        // Update post
        const updatedPost = await appwriteService.updatePost(post.$id, {
          title: data.title,
          content: data.content,
          featuredImage: fileId,
          status: data.status,
        });

        if (updatedPost) {
          navigate(`/post/${updatedPost.$id}`);
        } else {
          alert("Post update failed.");
        }
      } else {
        // Create new post
        const newPost = await appwriteService.createPost({
          title: data.title,
          slug: data.slug,
          content: data.content,
          featuredImage: fileId,
          status: data.status,
          userId: userData.$id,
        });

        if (newPost) {
          navigate(`/post/${newPost.$id}`);
        } else {
          alert("Post creation failed.");
        }
      }
    } catch (error) {
      console.error("Submit Error:", error);
      alert("Something went wrong. Check console for details.");
    }
  };

  const slugTransform = useCallback((value) => {
    if (value && typeof value === "string")
      return value
        .trim()
        .toLowerCase()
        .replace(/[^a-zA-Z\d\s]+/g, "-")
        .replace(/\s+/g, "-");

    return "";
  }, []);

  useEffect(() => {
    const subscription = watch((value, { name }) => {
      if (name === "title") {
        setValue("slug", slugTransform(value.title), { shouldValidate: true });
      }
    });

    return () => subscription.unsubscribe();
  }, [watch, slugTransform, setValue]);

  return (
    <form onSubmit={handleSubmit(submit)} className="flex flex-wrap" encType="multipart/form-data">
      <div className="w-2/3 px-2">
        <Input
          label="Title :"
          placeholder="Title"
          className="mb-4"
          {...register("title", { required: "Title is required" })}
        />
        {errors.title && <p className="text-red-500">{errors.title.message}</p>}

        <Input
          label="Slug :"
          placeholder="Slug"
          className="mb-4"
          {...register("slug", { required: "Slug is required" })}
          onInput={(e) => {
            setValue("slug", slugTransform(e.currentTarget.value), {
              shouldValidate: true,
            });
          }}
        />
        {errors.slug && <p className="text-red-500">{errors.slug.message}</p>}

        <RTE label="Content :" name="content" control={control} defaultValue={getValues("content")} />
      </div>
      <div className="w-1/3 px-2">
        <Input
          label="Featured Image :"
          type="file"
          className="mb-4"
          accept="image/png, image/jpg, image/jpeg, image/gif"
          {...register("image", { required: !post })}
        />
        {post && post.featuredImage && (
          <div className="w-full mb-4">
            <img
              src={appwriteService.getFilePreview(post.featuredImage)}
              alt={post.title}
              className="rounded-lg"
            />
          </div>
        )}

        <Select
          options={["active", "inactive"]}
          label="Status"
          className="mb-4"
          {...register("status", { required: true })}
        />
        <Button type="submit" bgColor={post ? "bg-green-500" : undefined} className="w-full">
          {post ? "Update" : "Submit"}
        </Button>
      </div>
    </form>
  );
}
