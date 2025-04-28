# Architecture

## Dependencies

### Frontend

> [!NOTE]
> All frontend components import React, this is not explicitly mentioned in the graph

```mermaid
graph LR
    subgraph Third-Party Libraries
        react-router-dom
        framer-motion
        d3
        papaparse
    end
    
    main[main.jsx] --> App[App.jsx]

    App --> react-router-dom
    App --> framer-motion

    App --> IndexPage[IndexPage.jsx]
    App --> FuturePage[FuturePage.jsx]
    App --> PageTransition[PageTransition.jsx]

    IndexPage --> react-router-dom

    FuturePage --> react-router-dom

    FuturePage --> InitialDistribution[InitialDistribution.jsx]
    FuturePage --> LikertChartContainer[LikertChartContainer.jsx]
    FuturePage --> CsvUpload[CsvUpload.jsx]
    FuturePage --> CsvDownload[CsvDownload.jsx]
    FuturePage --> LoadingIndicator[LoadingIndicator.jsx]

    PageTransition --> framer-motion

    InitialDistribution --> StackedBarChart[StackedBarChart.jsx]

    StackedBarChart --> d3

    LikertChartContainer --> LikertBar[LikertBar.jsx]
    LikertChartContainer --> StatisticsContainer[StatisticsContainer.jsx]

    LikertBar --> d3

    CsvUpload --> papaparse

    CsvDownload --> ErrorMessage[ErrorMessage.jsx]
```

### Backend

```mermaid
graph LR
  subgraph Standard Library
    os
    io
    csv
    zipfile
    typing
    statistics
    asyncio
    threading
  end

  subgraph Third-Party Libraries
    pandas
    flask
    flask_cors
    python-dotenv
    google.generativeai
    token_count
  end

  subgraph Production
    wsgi[wsgi.py]
  end

  %% Core app wiring
  wsgi --> app[app.py]

  app --> os
  app --> io
  app --> csv
  app --> zipfile
  app --> typing

  app --> pandas
  app --> flask
  app --> flask_cors

  app --> key_config[key_config.py]
  app --> llm_config[llm_config.py]
  app --> agent[agent.py]
  app --> get_data[get_data.py]
  app --> gemini_service[gemini_service.py]
  app --> llm_handler[llm_handler.py]
  app --> csv_service[csv_service.py]
  app --> agent_transformer[agent_transformer.py]

  key_config --> os
  key_config --> python-dotenv

  llm_config --> os
  llm_config --> typing
  llm_config --> google.generativeai
  llm_config --> gemini_service
  llm_config --> openai_service

  agent --> typing

  get_data --> statistics
  get_data --> typing

  gemini_service --> asyncio
  gemini_service --> threading
  gemini_service --> typing

  llm_handler --> typing
  llm_handler --> llm_config
  llm_handler --> agent
  llm_handler --> agent_transformer

  csv_service --> typing

  agent_transformer --> token_count
  agent_transformer --> typing
  agent_transformer --> llm_config
  agent_transformer --> agent

  %% Make all text black
  classDef default  fill:#ffffff,stroke:#888,stroke-width:1px,color:#000;
  classDef stdlib   fill:#e8f1fa,stroke:#1f77b4,stroke-width:2px,color:#000;
  classDef third    fill:#e8faea,stroke:#2ca02c,stroke-width:2px,color:#000;
  classDef core     fill:#fae8e8,stroke:#d62728,stroke-width:2px,color:#000;
  classDef prod     fill:#f2f2f2,stroke:#7f7f7f,stroke-width:2px,color:#000;

  class os,io,csv,zipfile,typing,statistics,asyncio,threading stdlib
  class pandas,flask,flask_cors,python-dotenv,google.generativeai,token_count third
  class key_config,llm_config,agent,get_data,gemini_service,llm_handler,csv_service,agent_transformer core
  class wsgi,app prod

  %% Edge coloring
  linkStyle 0                stroke:#e63946,stroke-width:2px
  linkStyle 1,2,3,4,5        stroke:#ff7f0e,stroke-width:2px
  linkStyle 6,7,8            stroke:#2ca02c,stroke-width:2px
  linkStyle 9,10,11,12,13,14,15,16  stroke:#1f77b4,stroke-width:2px
  linkStyle 17,18            stroke:#9467bd,stroke-width:2px
  linkStyle 19,20,21,22,23   stroke:#8c564b,stroke-width:2px
  linkStyle 24               stroke:#e377c2,stroke-width:2px
  linkStyle 25,26            stroke:#17becf,stroke-width:2px
  linkStyle 27,28,29         stroke:#bcbd22,stroke-width:2px
  linkStyle 30,31,32,33      stroke:#7f7f7f,stroke-width:2px
  linkStyle 34               stroke:#d33682,stroke-width:2px
  linkStyle 35,36,37,38      stroke:#ff1493,stroke-width:2px

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