package com.myproject.core.models;

import com.adobe.cq.export.json.ComponentExporter;
import com.adobe.cq.export.json.ExporterConstants;
import org.apache.sling.api.SlingHttpServletRequest;
import org.apache.sling.api.resource.Resource;
import org.apache.sling.api.resource.ResourceResolver;
import org.apache.sling.models.annotations.Default;
import org.apache.sling.models.annotations.Exporter;
import org.apache.sling.models.annotations.Model;
import org.apache.sling.models.annotations.injectorspecific.SlingObject;
import org.apache.sling.models.annotations.injectorspecific.ValueMapValue;

import javax.annotation.PostConstruct;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

@Model(
    adaptables = SlingHttpServletRequest.class,
    adapters = {ManualTable.class, ComponentExporter.class},
    resourceType = "my-project/components/manualtable"
)
@Exporter(name = ExporterConstants.SLING_MODEL_EXPORTER_NAME, extensions = ExporterConstants.SLING_MODEL_EXTENSION)
public class ManualTable implements ComponentExporter {

    @ValueMapValue
    @Default(values = "")
    private String tableData;

    @SlingObject
    private ResourceResolver resourceResolver;

    // 用于存储样式选项列表
    private List<Map<String, String>> allowedStyles = new ArrayList<>();

    @PostConstruct
    protected void init() {
        // 核心逻辑：读取样式配置
        // 路径可以是：
        // 1. 当前组件 Policy 的路径 (最佳实践)
        // 2. 这里的例子：为了演示，我们硬编码去读一个公共的 Text 组件配置，或者你自己组件 dialog 下的配置
        // 假设样式配置在：/apps/my-project/components/manualtable/cq:dialog/content/items/tabs/items/properties/items/styles/features
        // 实际开发中，建议把这个路径抽取为 OSGi 配置
        
        String stylesPath = "/apps/my-project/components/manualtable/_cq_dialog/content/items/tabs/items/properties/items/styles/features";
        Resource styleResource = resourceResolver.getResource(stylesPath);

        if (styleResource != null) {
            Iterator<Resource> children = styleResource.listChildren();
            while (children.hasNext()) {
                Resource styleItem = children.next();
                String label = styleItem.getValueMap().get("text", String.class);
                String cssName = styleItem.getValueMap().get("cssName", String.class);

                if (label != null && cssName != null) {
                    Map<String, String> map = new HashMap<>();
                    map.put("label", label);
                    map.put("value", cssName);
                    allowedStyles.add(map);
                }
            }
        }
    }

    public String getTableData() { return tableData; }

    // 导出给前端
    public List<Map<String, String>> getAllowedStyles() {
        return allowedStyles;
    }

    @Override
    public String getExportedType() { return "my-project/components/manualtable"; }
}