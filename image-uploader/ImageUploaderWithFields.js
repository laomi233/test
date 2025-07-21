const ImageWithCustomFields = (props) => {
    const { fileReference, custom } = props;
    const title = custom?.title;
    const description = custom?.description;
  
    return (
      <div>
        {fileReference && <img src={fileReference} alt={title || 'Image'} />}
        {title && <h3>{title}</h3>}
        {description && <p>{description}</p>}
      </div>
    );
  };
  
  const EditConfig = {
    emptyLabel: 'Image with Fields',
    isEmpty: props => !props?.fileReference && !props?.custom?.title && !props?.custom?.description,
  };
  
  MapTo('myproject/components/image-with-fields')(withConditionalPlaceHolder(ImageWithCustomFields, EditConfig));
  