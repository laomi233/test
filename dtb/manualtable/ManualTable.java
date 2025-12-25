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
    adapters = {ManualTable.class, ComponentExporter.class},
    resourceType = "my-project/components/manualtable"
)
@Exporter(name = ExporterConstants.SLING_MODEL_EXPORTER_NAME, extensions = ExporterConstants.SLING_MODEL_EXTENSION)
public class ManualTable implements ComponentExporter {

    @ValueMapValue
    @Default(values = "")
    private String tableData; // 存储 JSON 字符串

    public String getTableData() {
        return tableData;
    }

    @Override
    public String getExportedType() {
        return "my-project/components/manualtable";
    }
}