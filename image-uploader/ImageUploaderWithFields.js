import React from 'react';
import { MapTo } from '@adobe/aem-react-editable-components';

const CustomImageEditConfig = {
  emptyLabel: 'Custom Image',
  isEmpty: function(props) {
    return !props || (!props.fileReference && !props.src) || 
           (props.fileReference && props.fileReference.trim().length < 1) ||
           (props.src && props.src.trim().length < 1);
  }
};

/**
 * Custom Image Component that inherits from Core Image without Sling Model
 * Uses component inheritance at resource level + direct JCR properties
 */
const CustomImageInherited = (props) => {
  // Core Image properties (inherited automatically)
  const {
    fileReference,
    alt,
    'jcr:title': title,
    isDecorative,
    altValueFromDAM,
    titleValueFromDAM,
    displayPopupTitle,
    
    // Custom properties (from extended dialog)
    caption,
    photographer,
    imageCategory,
    displayCaption,
    overlayText,
    overlayPosition = 'bottom-left',
    customCssClass,
    linkUrl,
    openInNewTab,
    imageAlignment,
    borderRadius,
    
    // Component metadata
    cqPath,
    isInEditor = false
  } = props;

  // Generate image src - Core Image logic
  const generateImageSrc = () => {
    if (fileReference) {
      // Handle DAM asset reference
      return fileReference;
    }
    return props.src; // Direct src property
  };

  const src = generateImageSrc();

  if (!src) {
    return null;
  }

  // Handle alt text logic similar to Core Image
  const getAltText = () => {
    if (isDecorative) return '';
    if (alt) return alt;
    if (altValueFromDAM && fileReference) {
      // In a real scenario, you might extract this from DAM metadata
      // For now, we'll use the filename as fallback
      const filename = fileReference.split('/').pop();
      return filename ? filename.replace(/\.[^/.]+$/, '') : '';
    }
    return '';
  };

  // Handle title similar to Core Image
  const getTitle = () => {
    if (title) return title;
    if (titleValueFromDAM && fileReference) {
      // Similar to alt, could extract from DAM
      return '';
    }
    return displayPopupTitle ? getAltText() : '';
  };

  const imageClasses = [
    'cmp-image', // Keep core image class for styling compatibility
    'custom-image',
    customCssClass,
    imageCategory ? `image-category-${imageCategory}` : '',
    imageAlignment ? `image-align-${imageAlignment}` : '',
    overlayText ? 'has-overlay' : '',
    borderRadius ? 'has-border-radius' : ''
  ].filter(Boolean).join(' ');

  const imageStyles = {
    borderRadius: borderRadius ? `${borderRadius}px` : undefined
  };

  const renderImage = () => (
    <div className={`cmp-image__container custom-image-container ${overlayPosition}`}>
      <img 
        src={src}
        alt={getAltText()}
        title={getTitle()}
        className="cmp-image__image custom-image-element"
        style={imageStyles}
        loading="lazy"
      />
      {overlayText && (
        <div className="image-overlay">
          <span className="overlay-text">{overlayText}</span>
        </div>
      )}
    </div>
  );

  const renderCaption = () => {
    if (!displayCaption || (!caption && !photographer)) return null;
    
    return (
      <div className="cmp-image__caption custom-image-caption">
        {caption && <p className="caption-text">{caption}</p>}
        {photographer && <p className="photographer-credit">Photo by: {photographer}</p>}
      </div>
    );
  };

  const imageContent = (
    <div className={imageClasses}>
      {linkUrl ? (
        <a 
          href={linkUrl} 
          target={openInNewTab ? '_blank' : '_self'}
          rel={openInNewTab ? 'noopener noreferrer' : undefined}
          className="cmp-image__link custom-image-link"
        >
          {renderImage()}
        </a>
      ) : (
        renderImage()
      )}
      {renderCaption()}
    </div>
  );

  return imageContent;
};

// Map to your custom resource type that inherits from core image
MapTo('myproject/components/content/customimage')(CustomImageInherited, CustomImageEditConfig);

export default CustomImageInherited;