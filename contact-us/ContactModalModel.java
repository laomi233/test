package com.myproject.core.models;

import com.adobe.cq.export.json.ComponentExporter;
import com.adobe.cq.export.json.ExporterConstants;
import org.apache.sling.api.SlingHttpServletRequest;
import org.apache.sling.models.annotations.Default;
import org.apache.sling.models.annotations.Model;
import org.apache.sling.models.annotations.injectorspecific.ValueMapValue;

@Model(
    adaptables = SlingHttpServletRequest.class,
    adapters = { ComponentExporter.class },
    resourceType = "my-project/components/contact-modal"
)
@Exporter(name = ExporterConstants.SLING_MODEL_EXPORTER_NAME, extensions = ExporterConstants.SLING_MODEL_EXTENSION)
public class ContactModalModel implements ComponentExporter {

    @ValueMapValue
    @Default(values = "Contact Us")
    private String buttonLabel;

    @ValueMapValue
    @Default(values = "Get in Touch")
    private String modalTitle;

    public String getButtonLabel() { return buttonLabel; }
    public String getModalTitle() { return modalTitle; }

    @Override
    public String getExportedType() { return "my-project/components/contact-modal"; }
}