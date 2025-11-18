## Implementing an Editable Table Component in an AEM React SPA Project

This guide details the process of creating a custom Adobe Experience Manager (AEM) component for a React Single-Page Application (SPA) that allows authors to create and edit a table directly within the AEM editor. This is achieved by leveraging a multifield for the table data and configuring in-place editing through `cq:editConfig`.

### Core Concepts

At its heart, this implementation relies on a few key AEM and React concepts:

*   **AEM SPA Editor:** Enables in-place editing of content within a React application.
*   **Sling Models:** Server-side Java objects that process and export content from the AEM repository as JSON.
*   **Multifield:** An AEM dialog widget that allows authors to create a list of items, perfect for representing table rows.
*   **`cq:editConfig`:** A configuration node in AEM that defines the authoring behavior of a component, including in-place editing.
*   **React Editable Components:** A set of utilities provided by Adobe to integrate React components with the AEM SPA Editor.

### Step-by-Step Implementation

This implementation is broken down into three main parts: the AEM component definition, the Sling Model for data exposure, and the React component for rendering and editing.

#### 1. AEM Component Definition

First, define the AEM component structure, including its dialog for authoring the table data and the `cq:editConfig` for enabling in-place editing.

**a. Component Dialog (`.content.xml`)**

The component's dialog will feature a multifield to manage the table rows. Each item in the multifield will represent a row and contain fields for each cell.

```xml
<?xml version="1.0" encoding="UTF-8"?>
<jcr:root xmlns:sling="http://sling.apache.org/jcr/sling/1.0" xmlns:cq="http://www.day.com/jcr/cq/1.0" xmlns:jcr="http://www.jcp.org/jcr/1.0" xmlns:nt="http://www.jcp.org/jcr/nt/1.0"
    jcr:primaryType="nt:unstructured"
    jcr:title="Table"
    sling:resourceType="cq/gui/components/authoring/dialog">
    <content
        jcr:primaryType="nt:unstructured"
        sling:resourceType="granite/ui/components/coral/foundation/container">
        <items jcr:primaryType="nt:unstructured">
            <tableData
                jcr:primaryType="nt:unstructured"
                sling:resourceType="granite/ui/components/coral/foundation/form/multifield"
                composite="{Boolean}true"
                fieldLabel="Table Rows">
                <field
                    jcr:primaryType="nt:unstructured"
                    sling:resourceType="granite/ui/components/coral/foundation/container"
                    name="./tableData">
                    <items jcr:primaryType="nt:unstructured">
                        <cell1
                            jcr:primaryType="nt:unstructured"
                            sling:resourceType="granite/ui/components/coral/foundation/form/textfield"
                            fieldLabel="Cell 1"
                            name="./cell1"/>
                        <cell2
                            jcr:primaryType="nt:unstructured"
                            sling:resourceType="granite/ui/components/coral/foundation/form/textfield"
                            fieldLabel="Cell 2"
                            name="./cell2"/>
                    </items>
                </field>
            </tableData>
        </items>
    </content>
</jcr:root>
```

**b. Edit Configuration (`cq:editConfig`)**

The `cq:editConfig` node is crucial for enabling the in-place editing experience. It defines the in-place editor to be used for the table cells. To enable editing for multiple rich text fields within the component, you can configure child editors.

```xml
<?xml version="1.0" encoding="UTF-8"?>
<jcr:root xmlns:cq="http://www.day.com/jcr/cq/1.0" xmlns:jcr="http://www.jcp.org/jcr/1.0" xmlns:nt="http://www.jcp.org/jcr/nt/1.0"
    jcr:primaryType="cq:EditConfig">
    <cq:inplaceEditing
        jcr:primaryType="cq:InplaceEditingConfig"
        active="{Boolean}true"
        editorType="hybrid">
        <cq:childEditors jcr:primaryType="nt:unstructured">
            <table
                jcr:primaryType="cq:ChildEditorConfig"
                title="Table"
                type="table"/>
        </cq:childEditors>
    </cq:inplaceEditing>
</jcr:root>
```

It is also possible to configure multiple in-place editors for different parts of a component. For detailed configurations, refer to the AEM documentation.

#### 2. Sling Model for Data Export

Next, create a Sling Model to read the multifield data from the JCR and expose it as a JSON object. This JSON will be consumed by your React component.

```java
package com.yourproject.core.models;

import com.adobe.cq.export.json.ComponentExporter;
import com.adobe.cq.export.json.ExporterConstants;
import org.apache.sling.api.SlingHttpServletRequest;
import org.apache.sling.api.resource.Resource;
import org.apache.sling.models.annotations.DefaultInjectionStrategy;
import org.apache.sling.models.annotations.Exporter;
import org.apache.sling.models.annotations.Model;
import org.apache.sling.models.annotations.injectorspecific.ChildResource;

import javax.inject.Named;
import java.util.List;

@Model(
    adaptables = SlingHttpServletRequest.class,
    adapters = {ComponentExporter.class},
    resourceType = TableModel.RESOURCE_TYPE,
    defaultInjectionStrategy = DefaultInjectionStrategy.OPTIONAL
)
@Exporter(
    name = ExporterConstants.SLING_MODEL_EXPORTER_NAME,
    extensions = ExporterConstants.SLING_MODEL_EXTENSION
)
public class TableModel implements ComponentExporter {

    static final String RESOURCE_TYPE = "yourproject/components/table";

    @ChildResource
    @Named("tableData")
    private List<TableRow> tableData;

    public List<TableRow> getTableData() {
        return tableData;
    }

    @Override
    public String getExportedType() {
        return RESOURCE_TYPE;
    }

    @Model(
        adaptables = Resource.class,
        defaultInjectionStrategy = DefaultInjectionStrategy.OPTIONAL
    )
    public static class TableRow {

        @javax.inject.Inject
        private String cell1;

        @javax.inject.Inject
        private String cell2;

        public String getCell1() {
            return cell1;
        }

        public String getCell2() {
            return cell2;
        }
    }
}
```

This Sling Model maps the multifield data to a list of `TableRow` objects, which will be serialized into a JSON array.

#### 3. React Component for Rendering and Editing

Finally, create the React component that will render the table and enable in-place editing for each cell. This component will use the `MapTo` function from `@adobe/aem-react-editable-components` to map the AEM component to the React component.

```javascript
import React from 'react';
import { MapTo } from '@adobe/aem-react-editable-components';

const TableEditConfig = {
    emptyLabel: 'Table',
    isEmpty: function(props) {
        return !props || !props.tableData || props.tableData.length === 0;
    }
};

const Table = ({ tableData }) => {
    if (TableEditConfig.isEmpty({ tableData })) {
        return <p>Please configure the table component.</p>;
    }

    return (
        <table>
            <tbody>
                {tableData.map((row, index) => (
                    <tr key={index}>
                        <td data-aue-prop="tableData" data-aue-type="richtext" data-aue-filter="richtext" data-aue-item={index} data-aue-model="cell1" dangerouslySetInnerHTML={{ __html: row.cell1 }} />
                        <td data-aue-prop="tableData" data-aue-type="richtext" data-aue-filter="richtext" data-aue-item={index} data-aue-model="cell2" dangerouslySetInnerHTML={{ __html: row.cell2 }} />
                    </tr>
                ))}
            </tbody>
        </table>
    );
};

export default MapTo('yourproject/components/table')(Table, TableEditConfig);
```

**Key attributes for in-place editing in the React component:**

*   **`data-aue-prop`**: Specifies the property name in the Sling Model that holds the data (`tableData`).
*   **`data-aue-type`**: Defines the type of editor to use, in this case, `richtext`.
*   **`data-aue-filter`**: A filter to apply to the editor.
*   **`data-aue-item`**:  The index of the item within the multifield. This is crucial for targeting the correct data.
*   **`data-aue-model`**: The property name within the multifield item (`cell1`, `cell2`).

By using these data attributes, the AEM SPA Editor can identify which part of the content is being edited and persist the changes back to the correct location in the JCR.

### Conclusion

This approach provides a robust solution for creating editable tables within an AEM React SPA. By combining the power of multifields for data storage, Sling Models for JSON export, and the AEM SPA Editor's in-place editing capabilities, you can deliver a seamless and intuitive authoring experience for your content editors. This method can be extended to support more complex table structures with additional columns and different data types by modifying the dialog, Sling Model, and React component accordingly.