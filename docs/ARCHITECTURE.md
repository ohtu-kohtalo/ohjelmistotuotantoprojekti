# Architecture

## Dependencies

### Frontend

> [!NOTE]
> All frontend components import React, this is not explicitly mentioned in the graph

```mermaid
graph LR
    App[App.jsx] -->|uses| ErrorMessage[ErrorMessage.jsx]
    App -->|uses| SuccessMessage[SuccessMessage.jsx]
    App -->|uses| HelpPage[HelpPage.jsx]
    App -->|uses| InitialDistribution[IntialDistribution.jsx]
    App -->|uses| AddQuery[AddQuery.jsx]
    App -->|uses| FutureDistribution[FutureDistribution.jsx]
    App -->|uses| CsvDownload[CsvDownload.jsx]

    InitialDistribution -->|uses| PlotContainer[PlotContainer.jsx]

    AddQuery -->|uses| Title[Title.jsx]
    AddQuery -->|uses| CsvUpload[CsvUpload.jsx]
    AddQuery -->|uses| LoadingIndicator[LoadingIndicator.jsx]
    AddQuery -->|uses| LikertChartContainer[LikertChartContainer.jsx]

    CsvDownload -->|uses| ErrorMessage

    LikertChartContainer -->|uses| LikertBar[LikertBar.jsx]
    LikertChartContainer -->|uses| StatisticsContainer[StatisticsContainer.jsx]

    PlotContainer -->|uses| StackedBarChart[StackedBarChart.jsx]

    main[main.jsx] -->|renders| App

    subgraph Third-Party Libraries
        papaparse
        d3
        react-router
    end

    CsvUpload -->|imports| papaparse
    LikertBar -->|imports| d3
    StackedBarChart -->|imports| d3
    App -->|imports| react-router

```

### Backend

```mermaid
graph LR
    app[app.py] -->|imports| key_config[key_config.py]
    app -->|imports| llm_config[llm_config.py]
    app -->|imports| agent[agent.py]
    app -->|imports| get_data[get_data.py]
    app -->|imports| gemini_service[gemini_service.py]
    app -->|imports| llm_handler[llm_handler.py]
    app -->|imports| csv_service[csv_service.py]

    llm_handler -->|imports| llm_config
    llm_handler -->|imports| agent

    openai_service[openai_service.py] -->|imports| key_config

    llm_config -->|imports| openai_service
    llm_config -->|imports| gemini_service

    subgraph Production
        wsgi[wsgi.py]
    end

    wsgi -->|imports| app

    subgraph Standard Library
        os
        asyncio
        threading
        statistics
        io
        csv
    end

    subgraph Third-Party Libraries
        openai
        pandas
        flask
        flask_cors
        python-dotenv
        google.generativeai
    end

    gemini_service -->|imports| asyncio
    gemini_service -->|imports| threading

    get_data -->|imports| statistics

    openai_service -->|imports| asyncio
    openai_service -->|imports| threading
    openai_service -->|imports| openai

    app -->|imports| os
    app -->|imports| io
    app -->|imports| csv
    app -->|imports| pandas
    app -->|imports| flask
    app -->|imports| flask_cors

    key_config -->|imports| os
    key_config -->|imports| python-dotenv

    llm_config -->|imports| os
    llm_config -->|imports| google.generativeai


```

## Application flowchart

```mermaid
graph TD
    %% User Actions
    subgraph User Actions
        UA1[Open website]
        UA2[Upload CSV]
        %%UA3[Quick add question]
        UA4[Click Download CSV]
    end

    subgraph Agent Creation
        F1["Call GET / (create_agents)"]
        B1["GET / (create_agents)"]
        B2[Return agents JSON]
        F2[Store agents in state & show success message]
    end

    subgraph CSV Upload
        F4[Call handleCsvSubmit]
        B3[POST /receive_user_csv]
        B4[Process CSV & generate distributions]
        B5[Return distribution data]
        F5[Update state with distribution data]
        F6[Show success/error message]
        F7[Render LikertChartContainer with response data]
    end

    %% Quick Add currently not in use
    
    %%subgraph Quick Add
        %%Q1[User enters question & clicks Add]
        %%Q2[Update question list in state]
        %%Q3[User clicks Submit]
    %%end

    subgraph CSV Download
        B6[POST /download_agent_response_csv]
        B7[Generate CSV file from responses]
        B8[Return CSV file]
        F9[Trigger file download in browser]
    end

    UA1 --> F1
    F1 --> B1
    B1 --> B2
    B2 --> F2

    UA2 --> F4
    F4 --> B3
    B3 --> B4
    B4 --> B5
    B5 --> F5
    F5 --> F6
    F6 --> F7

    %%UA3 --> Q1
    %%Q1 --> Q2
    %%Q2 --> Q3

    UA4 --> B6
    B6 --> B7
    B7 --> B8
    B8 --> F9
```
