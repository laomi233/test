package com.mysite.core.models;
import com.adobe.cq.export.json.ComponentExporter;

public interface ContactCard extends ComponentExporter {
    String getTitle();
    String getText();
    String getFileReference();
    String getWidthPercentage();
    int getNumberOfLines();
}