package com.mysite.core.models.impl;

import com.adobe.cq.export.json.ComponentExporter;
import com.adobe.cq.export.json.ExporterConstants;
import com.mysite.core.models.ContactCard;
import org.apache.sling.api.SlingHttpServletRequest;
import org.apache.sling.models.annotations.Default;
import org.apache.sling.models.annotations.DefaultInjectionStrategy;
import org.apache.sling.models.annotations.Model;
import org.apache.sling.models.annotations.injectorspecific.ValueMapValue;

@Model(
    adaptables = SlingHttpServletRequest.class,
    adapters = { ContactCard.class, ComponentExporter.class },
    resourceType = ContactCardImpl.RESOURCE_TYPE,
    defaultInjectionStrategy = DefaultInjectionStrategy.OPTIONAL
)
@Exporter(name = ExporterConstants.SLING_MODEL_EXPORTER_NAME, extensions = ExporterConstants.SLING_MODEL_EXTENSION)
public class ContactCardImpl implements ContactCard {

    static final String RESOURCE_TYPE = "mysite/components/contact-card";

    @ValueMapValue
    private String title;

    @ValueMapValue
    private String text;

    @ValueMapValue
    private String fileReference;

    @ValueMapValue
    @Default(values = "30")
    private String widthPercentage;

    @ValueMapValue
    @Default(intValues = 6) // 默认 6 行高度
    private int numberOfLines;

    @Override
    public String getTitle() { return title; }

    @Override
    public String getText() { return text; }

    @Override
    public String getFileReference() { return fileReference; }

    @Override
    public String getWidthPercentage() { return widthPercentage; }

    @Override
    public int getNumberOfLines() { return numberOfLines; }

    @Override
    public String getExportedType() { return RESOURCE_TYPE; }
}