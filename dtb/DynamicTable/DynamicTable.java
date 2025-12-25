package com.myproject.core.models;

import com.adobe.cq.export.json.ComponentExporter;
import com.adobe.cq.export.json.ExporterConstants;
import org.apache.sling.api.SlingHttpServletRequest;
import org.apache.sling.models.annotations.Default;
import org.apache.sling.models.annotations.Exporter;
import org.apache.sling.models.annotations.Model;
import org.apache.sling.models.annotations.injectorspecific.ValueMapValue;

@Model(
    adaptables = SlingHttpServletRequest.class,
    adapters = {DynamicTable.class, ComponentExporter.class},
    resourceType = DynamicTable.RESOURCE_TYPE
)
@Exporter(name = ExporterConstants.SLING_MODEL_EXPORTER_NAME, extensions = ExporterConstants.SLING_MODEL_EXTENSION)
public class DynamicTable implements ComponentExporter {

    static final String RESOURCE_TYPE = "my-project/components/dynamic-table";

    @ValueMapValue
    @Default(values = "")
    private String tableContent;

    // Getter 暴露给前端 JSON
    public String getTableContent() {
        return tableContent;
    }

    @Override
    public String getExportedType() {
        return RESOURCE_TYPE;
    }
}