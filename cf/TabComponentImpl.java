import com.adobe.cq.dam.cfm.ContentFragment;
import com.adobe.cq.dam.cfm.ContentElement;
import org.apache.sling.api.resource.Resource;
import org.apache.sling.api.resource.ResourceResolver;
import org.apache.sling.models.annotations.Model;
import org.apache.sling.models.annotations.injectorspecific.ChildResource;
import org.apache.sling.models.annotations.injectorspecific.SlingObject;
import org.apache.sling.models.annotations.injectorspecific.ValueMapValue;

import java.util.*;

// 1. 父组件 Model
@Model(adaptables = Resource.class, resourceType = "my-app/components/customtabs")
public class TabComponentImpl {

    @ChildResource(name = "tabs")
    private List<TabItemImpl> tabs; // 获取所有 Tab 节点

    public List<TabItemImpl> getTabs() {
        return tabs != null ? tabs : Collections.emptyList();
    }
}

// 2. 每一个 Tab 的 Model
@Model(adaptables = Resource.class)
public class TabItemImpl {

    @ValueMapValue
    private String tabTitle;

    @ValueMapValue
    private String[] cfPaths; // 获取对话框中配置的路径数组

    @SlingObject
    private ResourceResolver resourceResolver;

    public String getTabTitle() { return tabTitle; }

    // 核心逻辑：获取当前 Tab 下所有有效的 CF 数据
    public List<Map<String, Object>> getCfDataList() {
        List<Map<String, Object>> cfList = new ArrayList<>();

        if (cfPaths == null || cfPaths.length == 0) return cfList;

        for (String path : cfPaths) {
            Map<String, Object> cfWrapper = new HashMap<>();
            cfWrapper.put("path", path); // 保留原始路径，方便前端做提示

            // 【容错机制 1】尝试获取资源，如果作者删除了 CF，这里 res 就是 null
            Resource cfResource = resourceResolver.getResource(path);
            
            if (cfResource != null) {
                // 将资源适配为 AEM 的 ContentFragment API
                ContentFragment fragment = cfResource.adaptTo(ContentFragment.class);
                if (fragment != null) {
                    // 提取 Elements 数据，按前端需要的格式组装
                    Map<String, Object> elementsMap = new HashMap<>();
                    Iterator<ContentElement> elements = fragment.getElements();
                    while (elements.hasNext()) {
                        ContentElement element = elements.next();
                        Map<String, Object> elementProps = new HashMap<>();
                        elementProps.put("value", element.getContent()); // 获取字段值
                        elementProps.put("dataType", element.getValue().getContentType());
                        elementsMap.put(element.getName(), elementProps);
                    }
                    cfWrapper.put("elements", elementsMap);
                    cfWrapper.put("isValid", true);
                } else {
                    cfWrapper.put("isValid", false); // 路径存在，但不是有效的 CF
                }
            } else {
                cfWrapper.put("isValid", false); // 资源已被删除
            }

            cfList.add(cfWrapper);
        }
        return cfList;
    }
}