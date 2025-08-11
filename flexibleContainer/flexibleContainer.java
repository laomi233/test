package com.yourproject.core.models;

import com.adobe.cq.export.json.ComponentExporter;
import com.adobe.cq.export.json.ExporterConstants;
import com.adobe.cq.wcm.core.components.models.Container;
import com.adobe.cq.wcm.core.components.models.ListItem;
import com.fasterxml.jackson.annotation.JsonProperty;
import org.apache.sling.api.SlingHttpServletRequest;
import org.apache.sling.api.resource.Resource;
import org.apache.sling.models.annotations.DefaultInjectionStrategy;
import org.apache.sling.models.annotations.Exporter;
import org.apache.sling.models.annotations.Model;
import org.apache.sling.models.annotations.injectorspecific.ChildResource;
import org.apache.sling.models.annotations.injectorspecific.ValueMapValue;
import org.apache.sling.models.annotations.injectorspecific.SlingObject;

import javax.annotation.PostConstruct;
import java.util.List;

@Model(
    adaptables = {SlingHttpServletRequest.class, Resource.class},
    adapters = {FlexibleContainer.class, ComponentExporter.class},
    resourceType = FlexibleContainer.RESOURCE_TYPE,
    defaultInjectionStrategy = DefaultInjectionStrategy.OPTIONAL
)
@Exporter(name = ExporterConstants.SLING_MODEL_EXPORTER_NAME, extensions = ExporterConstants.SLING_MODEL_EXTENSION)
public class FlexibleContainer implements ComponentExporter {

    public static final String RESOURCE_TYPE = "yourproject/components/flexiblecontainer";

    @SlingObject
    private Resource resource;

    @ValueMapValue
    private String backgroundColor;

    @ValueMapValue
    private String backgroundImage;

    @ValueMapValue
    private String layoutDirection = "column"; // column or row

    @ValueMapValue
    private String containerPadding = "20px";

    @ValueMapValue
    private String containerMargin = "0";

    @ValueMapValue
    private String minHeight = "100px";

    @ValueMapValue
    private String maxWidth = "100%";

    @ValueMapValue
    private Boolean enableDropTarget = true;

    @ValueMapValue
    private String cssClasses;

    @ChildResource
    private List<Resource> items;

    private String containerId;

    @PostConstruct
    private void init() {
        // Generate unique container ID for editing purposes
        containerId = "container-" + resource.getPath().hashCode();
    }

    @JsonProperty("backgroundColor")
    public String getBackgroundColor() {
        return backgroundColor;
    }

    @JsonProperty("backgroundImage")
    public String getBackgroundImage() {
        return backgroundImage;
    }

    @JsonProperty("layoutDirection")
    public String getLayoutDirection() {
        return layoutDirection;
    }

    @JsonProperty("containerPadding")
    public String getContainerPadding() {
        return containerPadding;
    }

    @JsonProperty("containerMargin")
    public String getContainerMargin() {
        return containerMargin;
    }

    @JsonProperty("minHeight")
    public String getMinHeight() {
        return minHeight;
    }

    @JsonProperty("maxWidth")
    public String getMaxWidth() {
        return maxWidth;
    }

    @JsonProperty("enableDropTarget")
    public Boolean getEnableDropTarget() {
        return enableDropTarget;
    }

    @JsonProperty("cssClasses")
    public String getCssClasses() {
        return cssClasses;
    }

    @JsonProperty("containerId")
    public String getContainerId() {
        return containerId;
    }

    @JsonProperty("items")
    public List<Resource> getItems() {
        return items;
    }

    @JsonProperty("isEmpty")
    public boolean isEmpty() {
        return items == null || items.isEmpty();
    }

    @Override
    public String getExportedType() {
        return RESOURCE_TYPE;
    }
}