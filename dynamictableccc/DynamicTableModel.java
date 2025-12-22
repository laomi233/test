// DynamicTableModel.java
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

import javax.annotation.PostConstruct;
import java.util.ArrayList;
import java.util.List;

@Model(
    adaptables = {SlingHttpServletRequest.class, Resource.class},
    adapters = {DynamicTableModel.class, ComponentExporter.class},
    resourceType = DynamicTableModel.RESOURCE_TYPE,
    defaultInjectionStrategy = DefaultInjectionStrategy.OPTIONAL
)
@Exporter(
    name = ExporterConstants.SLING_MODEL_EXPORTER_NAME,
    extensions = ExporterConstants.SLING_MODEL_EXTENSION
)
public class DynamicTableModel implements ComponentExporter {

    public static final String RESOURCE_TYPE = "myproject/components/dynamictable";

    @ChildResource
    private List<Resource> rows;

    private List<List<CellData>> tableData;

    @PostConstruct
    protected void init() {
        tableData = new ArrayList<>();
        
        if (rows != null) {
            for (Resource rowResource : rows) {
                List<CellData> rowData = new ArrayList<>();
                Iterable<Resource> cells = rowResource.getChildren();
                
                for (Resource cellResource : cells) {
                    CellData cell = new CellData();
                    cell.setContent(cellResource.getValueMap().get("content", String.class));
                    rowData.add(cell);
                }
                
                if (!rowData.isEmpty()) {
                    tableData.add(rowData);
                }
            }
        }
        
        // 如果没有数据,创建默认的3x3表格
        if (tableData.isEmpty()) {
            for (int i = 0; i < 3; i++) {
                List<CellData> row = new ArrayList<>();
                for (int j = 0; j < 3; j++) {
                    CellData cell = new CellData();
                    cell.setContent("");
                    row.add(cell);
                }
                tableData.add(row);
            }
        }
    }

    public List<List<CellData>> getRows() {
        return tableData;
    }

    @Override
    public String getExportedType() {
        return RESOURCE_TYPE;
    }

    public static class CellData {
        private String content;

        public String getContent() {
            return content;
        }

        public void setContent(String content) {
            this.content = content;
        }
    }
}