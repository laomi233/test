// src/components/ImageUploaderWithFields.js
import React from 'react';
import { MapTo, withConditionalPlaceHolder } from '@adobe/aem-react-editable-components';

const ImageUploaderWithFields = (props) => {
  const { fileReference, title, description } = props;

  return (
    <div className="image-uploader-with-fields" style={{ maxWidth: '600px' }}>
      {fileReference ? (
        <img src={fileReference} alt={title || 'Image'} style={{ width: '100%', marginBottom: '10px' }} />
      ) : (
        <div style={{ backgroundColor: '#eee', padding: '20px', textAlign: 'center' }}>No image uploaded</div>
      )}

      {title && <h2>{title}</h2>}
      {description && <p>{description}</p>}
    </div>
  );
};

const EditConfig = {
  emptyLabel: 'Image with Fields',
  isEmpty: (props) => {
    return !props || (!props.fileReference && !props.title && !props.description);
  },
};

MapTo('myproject/components/image-uploader')(withConditionalPlaceHolder(ImageUploaderWithFields, EditConfig));
