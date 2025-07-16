// =============================================================================
// SLING MODELS FOR HSI COMPONENTS
// =============================================================================

// IndexCardModel.java
package com.test.aem.core.models;

import org.apache.sling.api.SlingHttpServletRequest;
import org.apache.sling.api.resource.Resource;
import org.apache.sling.models.annotations.Model;
import org.apache.sling.models.annotations.injectorspecific.ValueMapValue;
import org.apache.sling.models.annotations.injectorspecific.OSGiService;
import org.apache.sling.models.annotations.DefaultInjectionStrategy;
import org.apache.sling.models.annotations.PostConstruct;
import com.test.aem.core.services.MarketDataService;
import com.test.aem.core.beans.IndexData;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

@Model(adaptables = {SlingHttpServletRequest.class, Resource.class}, 
       defaultInjectionStrategy = DefaultInjectionStrategy.OPTIONAL)
public class IndexCardModel {
    
    @ValueMapValue
    private String indexName;
    
    @ValueMapValue
    private String indexCode;
    
    @ValueMapValue
    private String displayType; // card, table, chart
    
    @ValueMapValue
    private boolean showChart;
    
    @ValueMapValue
    private boolean realTimeUpdate;
    
    @ValueMapValue
    private String chartHeight;
    
    @ValueMapValue
    private String refreshInterval;
    
    @OSGiService
    private MarketDataService marketDataService;
    
    private IndexData indexData;
    private String indexDataJson;
    
    @PostConstruct
    protected void init() {
        if (indexCode != null && !indexCode.isEmpty()) {
            try {
                indexData = marketDataService.getCurrentIndexData(indexCode);
                ObjectMapper mapper = new ObjectMapper();
                indexDataJson = mapper.writeValueAsString(indexData);
            } catch (Exception e) {
                // Log error and set default values
                indexData = new IndexData();
                indexDataJson = "{}";
            }
        }
    }
    
    // Getters
    public String getIndexName() { return indexName; }
    public String getIndexCode() { return indexCode; }
    public String getDisplayType() { return displayType != null ? displayType : "card"; }
    public boolean isShowChart() { return showChart; }
    public boolean isRealTimeUpdate() { return realTimeUpdate; }
    public String getChartHeight() { return chartHeight != null ? chartHeight : "300px"; }
    public String getRefreshInterval() { return refreshInterval != null ? refreshInterval : "30000"; }
    public IndexData getIndexData() { return indexData; }
    public String getIndexDataJson() { return indexDataJson; }
}

// MarketDataModel.java
package com.test.aem.core.models;

import org.apache.sling.api.SlingHttpServletRequest;
import org.apache.sling.api.resource.Resource;
import org.apache.sling.models.annotations.Model;
import org.apache.sling.models.annotations.injectorspecific.ValueMapValue;
import org.apache.sling.models.annotations.injectorspecific.OSGiService;
import org.apache.sling.models.annotations.DefaultInjectionStrategy;
import org.apache.sling.models.annotations.PostConstruct;
import com.test.aem.core.services.MarketDataService;
import com.test.aem.core.beans.MarketSummary;
import java.util.List;
import java.util.Arrays;

@Model(adaptables = {SlingHttpServletRequest.class, Resource.class}, 
       defaultInjectionStrategy = DefaultInjectionStrategy.OPTIONAL)
public class MarketDataModel {
    
    @ValueMapValue
    private String[] selectedIndices;
    
    @ValueMapValue
    private String viewType; // summary, detailed, compact
    
    @ValueMapValue
    private boolean showPerformance;
    
    @ValueMapValue
    private String sortBy; // name, value, change, volume
    
    @OSGiService
    private MarketDataService marketDataService;
    
    private List<MarketSummary> marketData;
    
    @PostConstruct
    protected void init() {
        try {
            if (selectedIndices != null && selectedIndices.length > 0) {
                marketData = marketDataService.getMarketSummary(Arrays.asList(selectedIndices));
            } else {
                // Default to major indices
                marketData = marketDataService.getMajorIndicesSummary();
            }
            
            // Sort data based on sortBy parameter
            if (sortBy != null && marketData != null) {
                marketData = marketDataService.sortMarketData(marketData, sortBy);
            }
        } catch (Exception e) {
            // Log error and initialize empty list
            marketData = List.of();
        }
    }
    
    // Getters
    public String[] getSelectedIndices() { return selectedIndices; }
    public String getViewType() { return viewType != null ? viewType : "summary"; }
    public boolean isShowPerformance() { return showPerformance; }
    public String getSortBy() { return sortBy != null ? sortBy : "name"; }
    public List<MarketSummary> getMarketData() { return marketData; }
}

// NewsListModel.java
package com.test.aem.core.models;

import org.apache.sling.api.SlingHttpServletRequest;
import org.apache.sling.api.resource.Resource;
import org.apache.sling.models.annotations.Model;
import org.apache.sling.models.annotations.injectorspecific.ValueMapValue;
import org.apache.sling.models.annotations.injectorspecific.OSGiService;
import org.apache.sling.models.annotations.DefaultInjectionStrategy;
import org.apache.sling.models.annotations.PostConstruct;
import com.test.aem.core.services.NewsService;
import com.test.aem.core.beans.NewsItem;
import java.util.List;

@Model(adaptables = {SlingHttpServletRequest.class, Resource.class}, 
       defaultInjectionStrategy = DefaultInjectionStrategy.OPTIONAL)
public class NewsListModel {
    
    @ValueMapValue
    private String category; // market, indices, announcements
    
    @ValueMapValue
    private String language; // en, zh
    
    @ValueMapValue
    private int maxItems;
    
    @ValueMapValue
    private boolean showExcerpt;
    
    @ValueMapValue
    private boolean showDate;
    
    @ValueMapValue
    private String dateFormat;
    
    @OSGiService
    private NewsService newsService;
    
    private List<NewsItem> newsItems;
    
    @PostConstruct
    protected void init() {
        try {
            int itemLimit = maxItems > 0 ? maxItems : 10;
            String newsCategory = category != null ? category : "all";
            String newsLanguage = language != null ? language : "en";
            
            newsItems = newsService.getNews(newsCategory, newsLanguage, itemLimit);
        } catch (Exception e) {
            // Log error and initialize empty list
            newsItems = List.of();
        }
    }
    
    // Getters
    public String getCategory() { return category; }
    public String getLanguage() { return language; }
    public int getMaxItems() { return maxItems; }
    public boolean isShowExcerpt() { return showExcerpt; }
    public boolean isShowDate() { return showDate; }
    public String getDateFormat() { return dateFormat != null ? dateFormat : "dd MMM yyyy"; }
    public List<NewsItem> getNewsItems() { return newsItems; }
}

// ChartComponentModel.java
package com.test.aem.core.models;

import org.apache.sling.api.SlingHttpServletRequest;
import org.apache.sling.api.resource.Resource;
import org.apache.sling.models.annotations.Model;
import org.apache.sling.models.annotations.injectorspecific.ValueMapValue;
import org.apache.sling.models.annotations.injectorspecific.OSGiService;
import org.apache.sling.models.annotations.DefaultInjectionStrategy;
import org.apache.sling.models.annotations.PostConstruct;
import com.test.aem.core.services.MarketDataService;
import com.test.aem.core.beans.ChartData;
import com.fasterxml.jackson.databind.ObjectMapper;

@Model(adaptables = {SlingHttpServletRequest.class, Resource.class}, 
       defaultInjectionStrategy = DefaultInjectionStrategy.OPTIONAL)
public class ChartComponentModel {
    
    @ValueMapValue
    private String indexCode;
    
    @ValueMapValue
    private String chartType; // line, candlestick, area
    
    @ValueMapValue
    private String timeframe; // 1D, 5D, 1M, 3M, 6M, 1Y, 5Y
    
    @ValueMapValue
    private String height;
    
    @ValueMapValue
    private boolean showVolume;
    
    @ValueMapValue
    private boolean showIndicators;
    
    @ValueMapValue
    private String theme; // light, dark
    
    @OSGiService
    private MarketDataService marketDataService;
    
    private ChartData chartData;
    private String chartDataJson;
    
    @PostConstruct
    protected void init() {
        try {
            if (indexCode != null && !indexCode.isEmpty()) {
                String period = timeframe != null ? timeframe : "1M";
                chartData = marketDataService.getChartData(indexCode, period);
                
                ObjectMapper mapper = new ObjectMapper();
                chartDataJson = mapper.writeValueAsString(chartData);
            }
        } catch (Exception e) {
            // Log error and set default values
            chartDataJson = "{}";
        }
    }
    
    // Getters
    public String getIndexCode() { return indexCode; }
    public String getChartType() { return chartType != null ? chartType : "line"; }
    public String getTimeframe() { return timeframe != null ? timeframe : "1M"; }
    public String getHeight() { return height != null ? height : "400px"; }
    public boolean isShowVolume() { return showVolume; }
    public boolean isShowIndicators() { return showIndicators; }
    public String getTheme() { return theme != null ? theme : "light"; }
    public ChartData getChartData() { return chartData; }
    public String getChartDataJson() { return chartDataJson; }
}

// HeaderModel.java
package com.test.aem.core.models;

import org.apache.sling.api.SlingHttpServletRequest;
import org.apache.sling.api.resource.Resource;
import org.apache.sling.models.annotations.Model;
import org.apache.sling.models.annotations.injectorspecific.ValueMapValue;
import org.apache.sling.models.annotations.injectorspecific.SlingObject;
import org.apache.sling.models.annotations.DefaultInjectionStrategy;
import org.apache.sling.models.annotations.PostConstruct;
import com.day.cq.wcm.api.Page;

@Model(adaptables = {SlingHttpServletRequest.class, Resource.class}, 
       defaultInjectionStrategy = DefaultInjectionStrategy.OPTIONAL)
public class HeaderModel {
    
    @ValueMapValue
    private String logoPath;
    
    @ValueMapValue
    private String logoAlt;
    
    @ValueMapValue
    private boolean showLanguageSelector;
    
    @ValueMapValue
    private boolean showSearch;
    
    @ValueMapValue
    private String primaryNavigationRoot;
    
    @SlingObject
    private SlingHttpServletRequest request;
    
    private String currentLanguage;
    private String currentPath;
    
    @PostConstruct
    protected void init() {
        Page currentPage = request.getResource().adaptTo(Page.class);
        if (currentPage != null) {
            currentPath = currentPage.getPath();
            currentLanguage = currentPage.getLanguage(false).getLanguage();
        }
    }
    
    // Getters
    public String getLogoPath() { return logoPath; }
    public String getLogoAlt() { return logoAlt != null ? logoAlt : "HSI Logo"; }
    public boolean isShowLanguageSelector() { return showLanguageSelector; }
    public boolean isShowSearch() { return showSearch; }
    public String getPrimaryNavigationRoot() { return primaryNavigationRoot; }
    public String getCurrentLanguage() { return currentLanguage; }
    public String getCurrentPath() { return currentPath; }
}

// =============================================================================
// DATA BEANS
// =============================================================================

// IndexData.java
package com.test.aem.core.beans;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class IndexData {
    private String indexCode;
    private String indexName;
    private BigDecimal currentValue;
    private BigDecimal change;
    private BigDecimal changePercent;
    private BigDecimal volume;
    private BigDecimal high;
    private BigDecimal low;
    private LocalDateTime lastUpdate;
    private String status; // OPEN, CLOSED, PRE_MARKET, AFTER_MARKET
    
    // Constructors
    public IndexData() {}
    
    public IndexData(String indexCode, String indexName) {
        this.indexCode = indexCode;
        this.indexName = indexName;
    }
    
    // Getters and Setters
    public String getIndexCode() { return indexCode; }
    public void setIndexCode(String indexCode) { this.indexCode = indexCode; }
    
    public String getIndexName() { return indexName; }
    public void setIndexName(String indexName) { this.indexName = indexName; }
    
    public BigDecimal getCurrentValue() { return currentValue; }
    public void setCurrentValue(BigDecimal currentValue) { this.currentValue = currentValue; }
    
    public BigDecimal getChange() { return change; }
    public void setChange(BigDecimal change) { this.change = change; }
    
    public BigDecimal getChangePercent() { return changePercent; }
    public void setChangePercent(BigDecimal changePercent) { this.changePercent = changePercent; }
    
    public BigDecimal getVolume() { return volume; }
    public void setVolume(BigDecimal volume) { this.volume = volume; }
    
    public BigDecimal getHigh() { return high; }
    public void setHigh(BigDecimal high) { this.high = high; }
    
    public BigDecimal getLow() { return low; }
    public void setLow(BigDecimal low) { this.low = low; }
    
    public LocalDateTime getLastUpdate() { return lastUpdate; }
    public void setLastUpdate(LocalDateTime lastUpdate) { this.lastUpdate = lastUpdate; }
    
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    
    // Utility methods
    public boolean isPositiveChange() {
        return change != null && change.compareTo(BigDecimal.ZERO) > 0;
    }
    
    public boolean isNegativeChange() {
        return change != null && change.compareTo(BigDecimal.ZERO) < 0;
    }
    
    public String getChangeDirection() {
        if (isPositiveChange()) return "up";
        if (isNegativeChange()) return "down";
        return "neutral";
    }
}