package com.myproject.core.models;

import com.adobe.cq.export.json.ComponentExporter;
import com.adobe.cq.export.json.ExporterConstants;
import org.apache.sling.api.SlingHttpServletRequest;
import org.apache.sling.api.resource.Resource;
import org.apache.sling.models.annotations.DefaultInjectionStrategy;
import org.apache.sling.models.annotations.Exporter;
import org.apache.sling.models.annotations.Model;
import org.apache.sling.models.annotations.injectorspecific.ChildResource;
import org.apache.sling.models.annotations.injectorspecific.ValueMapValue;

import java.util.Collections;
import java.util.List;

@Model(
    adaptables = SlingHttpServletRequest.class,
    adapters = {SpaDynamicTable.class, ComponentExporter.class},
    resourceType = SpaDynamicTable.RESOURCE_TYPE,
    defaultInjectionStrategy = DefaultInjectionStrategy.OPTIONAL
)
@Exporter(name = ExporterConstants.SLING_MODEL_EXPORTER_NAME, extensions = ExporterConstants.SLING_MODEL_EXTENSION)
public class SpaDynamicTable implements ComponentExporter {

    static final String RESOURCE_TYPE = "my-project/components/spa-dynamic-table";

    // 1. Dialog 配置的属性
    @ValueMapValue
    private String tableCaption;

    @ValueMapValue
    private List<String> tableHeaders;

    // 2. 动态生成的子节点 (用于确定有多少行)
    // 结构预期: 当前节点 -> rows -> item0, item1...
    @ChildResource(name = "rows")
    private List<Resource> rows;

    public String getTableCaption() {
        return tableCaption;
    }

    public List<String> getTableHeaders() {
        return tableHeaders != null ? tableHeaders : Collections.emptyList();
    }

    public List<Resource> getRows() {
        return rows != null ? rows : Collections.emptyList();
    }

    @Override
    public String getExportedType() {
        return RESOURCE_TYPE;
    }
}