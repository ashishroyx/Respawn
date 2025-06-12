import React from 'react';
import { Editor } from '@tinymce/tinymce-react';
import { Controller } from 'react-hook-form';

export default function RTE({ name = "content", control, label, defaultValue = "" }) {
  return (
    <div className='w-full'>
      {label && <label className='inline-block mb-1 pl-1'>{label}</label>}

      <Controller
        name={name}
        control={control}
        defaultValue={defaultValue}
        render={({ field: { onChange, value } }) => (
          <Editor
            apiKey="x17y90cbemxkjhyha39ii830y81nkwd1r1rye5ito3sa74v9"
            value={value}
            onEditorChange={onChange}
            init={{
              height: 500,
              menubar: true,
              plugins: [
                "advlist", "autolink", "lists", "link", "image", "charmap", "preview",
                "anchor", "searchreplace", "visualblocks", "code", "fullscreen",
                "insertdatetime", "media", "table", "help", "wordcount"
              ],
              toolbar:
                "undo redo | blocks | image | bold italic forecolor | " +
                "alignleft aligncenter alignright alignjustify | " +
                "bullist numlist outdent indent | removeformat | help",
              content_style:
                "body { font-family:Helvetica,Arial,sans-serif; font-size:14px }"
            }}
          />
        )}
      />
    </div>
  );
}
