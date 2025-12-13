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
    resourceType = CustomTableModel.RESOURCE_TYPE
)
@Exporter(
    name = ExporterConstants.SLING_MODEL_EXPORTER_NAME, 
    extensions = ExporterConstants.SLING_MODEL_EXTENSION
)
public class CustomTableModel implements ComponentExporter {

    static final String RESOURCE_TYPE = "my-project/components/custom-table";

    @ValueMapValue
    @Default(values = "") // 如果节点没数据，返回空串，交由前端处理兜底
    private String tableData;

    public String getTableData() {
        return tableData;
    }

    @Override
    public String getExportedType() {
        return RESOURCE_TYPE;
    }
}