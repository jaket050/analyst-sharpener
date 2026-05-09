import { useState, useEffect, useCallback, useRef } from "react";

const C = {
  bg: "#080810", surface: "#0f0f1a", card: "#13131f", border: "#1c1c2e",
  accent: "#f5c542", text: "#e4e4f0", muted: "#55556a",
  sql: "#4fc3f7", excel: "#4ade80", tableau: "#c084fc", python: "#fb923c",
  ok: "#4ade80", err: "#f87171", warn: "#fbbf24",
};
const mono = "'DM Mono', monospace";
const sans = "'DM Sans', sans-serif";

const MODULES = [
  { id: "sql",     label: "SQL",     color: C.sql,     icon: "⬡" },
  { id: "excel",   label: "Excel",   color: C.excel,   icon: "◈" },
  { id: "tableau", label: "Tableau", color: C.tableau, icon: "◉" },
  { id: "python",  label: "Python",  color: C.python,  icon: "◆" },
];

// ── EXPANDED QUESTION BANK ────────────────────────────────────────────────────

const FLASHCARDS = {
  sql: [
    // Basic
    { level: "Basic", q: "What is the difference between WHERE and HAVING?", a: "WHERE filters rows before grouping. HAVING filters after aggregation. You cannot use aggregate functions like COUNT() or SUM() in WHERE — use HAVING for that." },
    { level: "Basic", q: "Explain INNER JOIN vs LEFT JOIN vs FULL OUTER JOIN.", a: "INNER JOIN returns only matching rows. LEFT JOIN returns all left rows plus matches from right (NULLs where no match). FULL OUTER JOIN returns all rows from both sides with NULLs where no match." },
    { level: "Basic", q: "What does NULL mean in SQL and how do you check for it?", a: "NULL means the absence of a value — not zero, not empty string. Use IS NULL or IS NOT NULL. You cannot use = NULL because NULL compared to anything returns UNKNOWN." },
    { level: "Basic", q: "What is the difference between DELETE, TRUNCATE, and DROP?", a: "DELETE removes specific rows and can be rolled back. TRUNCATE removes all rows fast and is usually not rollback-safe. DROP removes the entire table structure and data permanently." },
    { level: "Basic", q: "What is the difference between a primary key and a foreign key?", a: "A primary key uniquely identifies each row in a table — cannot be NULL or duplicate. A foreign key references a primary key in another table to enforce referential integrity between tables." },
    { level: "Basic", q: "What does DISTINCT do and when would you use it?", a: "DISTINCT removes duplicate rows from a result set. Use it when you need unique values — e.g. SELECT DISTINCT customer_id FROM orders. Be cautious on large tables as it adds a sort/dedup step." },
    { level: "Basic", q: "What is the difference between CHAR and VARCHAR?", a: "CHAR is fixed-length — always uses declared space (CHAR(10) always uses 10 bytes). VARCHAR is variable-length — uses only what it needs plus a small overhead. Use VARCHAR for variable text, CHAR for fixed codes like state abbreviations." },
    { level: "Basic", q: "What does the LIKE operator do? What do % and _ mean?", a: "LIKE performs pattern matching. % matches any sequence of characters (WHERE name LIKE 'A%' finds names starting with A). _ matches exactly one character. Use for flexible text searches." },
    { level: "Basic", q: "What is a self join and when would you use one?", a: "A self join joins a table to itself using an alias. Use it when rows in a table reference other rows in the same table — e.g. finding employees and their managers when both are in the same employees table." },
    { level: "Basic", q: "What is the difference between UNION and JOIN?", a: "UNION stacks result sets vertically — combining rows from two queries with the same columns. JOIN combines tables horizontally — merging columns based on a matching condition. They solve completely different problems." },
    // Intermediate
    { level: "Intermediate", q: "What is the difference between RANK(), DENSE_RANK(), and ROW_NUMBER()?", a: "ROW_NUMBER() gives unique sequential numbers. RANK() gives ties the same rank and skips next (1,1,3). DENSE_RANK() gives ties the same rank without skipping (1,1,2). All require OVER() clause." },
    { level: "Intermediate", q: "What is a CTE and when would you use one over a subquery?", a: "A CTE (Common Table Expression) is a named temporary result defined with WITH. Use it over subqueries for readability, when you need to reference the logic multiple times, or for recursive queries." },
    { level: "Intermediate", q: "What is the difference between UNION and UNION ALL?", a: "UNION removes duplicate rows from the combined result. UNION ALL keeps all rows including duplicates and is faster because it skips the deduplication step." },
    { level: "Intermediate", q: "What is a window function? Give an example.", a: "A window function performs a calculation across a set of rows related to the current row without collapsing them into one. Example: SUM(sales) OVER (PARTITION BY region ORDER BY date) gives a running total per region." },
    { level: "Intermediate", q: "What does COALESCE do and give a real use case.", a: "COALESCE returns the first non-NULL value from a list of arguments. Real use case: COALESCE(phone_mobile, phone_home, 'No phone') — returns the first available phone number or a default string." },
    { level: "Intermediate", q: "What is the difference between EXISTS and IN?", a: "IN checks if a value matches a list — can be slow on large subquery results. EXISTS checks if a subquery returns any rows — stops at first match, making it faster for large datasets. EXISTS is generally preferred for correlated subqueries." },
    { level: "Intermediate", q: "What is a correlated subquery?", a: "A correlated subquery references a column from the outer query and is re-executed for each row of the outer query. It is slower than a regular subquery but useful when you need row-by-row comparison — e.g. finding employees who earn above their department average." },
    { level: "Intermediate", q: "Explain the difference between aggregate and non-aggregate window functions.", a: "Aggregate window functions (SUM, AVG, COUNT with OVER) compute totals across partitions without collapsing rows. Non-aggregate window functions (RANK, LAG, LEAD, NTILE) provide ranking and offset calculations. Both keep every row in the result." },
    { level: "Intermediate", q: "What does LAG() and LEAD() do in SQL?", a: "LAG() accesses the value from a previous row in the result set. LEAD() accesses the value from a following row. Both use OVER() with ORDER BY. Common use: calculating month-over-month change — LAG(sales, 1) OVER (ORDER BY month)." },
    { level: "Intermediate", q: "What is normalization and why does it matter?", a: "Normalization organizes database tables to reduce redundancy and improve integrity. 1NF: atomic values, no repeating groups. 2NF: no partial dependencies on composite keys. 3NF: no transitive dependencies. It reduces update anomalies at the cost of more joins." },
    // Advanced
    { level: "Advanced", q: "What is query optimization and name 3 techniques?", a: "Query optimization improves execution speed. Techniques: create indexes on WHERE/JOIN/ORDER BY columns, avoid SELECT *, filter early to reduce rows, avoid functions on indexed columns in WHERE, use EXISTS over IN for large datasets." },
    { level: "Advanced", q: "What is the difference between OLTP and OLAP?", a: "OLTP handles real-time transactional operations optimized for small fast queries. OLAP handles large-scale analytical queries over historical data. Data warehouses like Snowflake and BigQuery are OLAP systems." },
    { level: "Advanced", q: "What is an execution plan and how do you use it?", a: "An execution plan shows how the database engine will execute a query — which indexes it uses, join types, scan types, and estimated costs. Use EXPLAIN or EXPLAIN ANALYZE to view it. Look for full table scans and high-cost operations to optimize." },
    { level: "Advanced", q: "What is a covering index?", a: "A covering index includes all columns needed to satisfy a query so the database never needs to access the main table. Example: an index on (customer_id, sale_amount) can cover SELECT sale_amount FROM orders WHERE customer_id = 5 entirely from the index." },
    { level: "Advanced", q: "What is the difference between a clustered and non-clustered index?", a: "A clustered index determines the physical sort order of table data — there can be only one per table (usually the primary key). A non-clustered index is a separate structure with pointers back to the main data. Multiple non-clustered indexes can exist per table." },
    { level: "Advanced", q: "What is a recursive CTE and when would you use one?", a: "A recursive CTE references itself to iterate through hierarchical data. It has an anchor member (base case) and a recursive member joined with UNION ALL. Use for org charts, bill of materials, folder structures — any parent-child hierarchy." },
    { level: "Advanced", q: "Explain database transactions and ACID properties.", a: "A transaction is a unit of work that must fully complete or fully roll back. ACID: Atomicity (all or nothing), Consistency (data stays valid), Isolation (concurrent transactions don't interfere), Durability (committed changes persist). Use BEGIN/COMMIT/ROLLBACK to control transactions." },
    { level: "Advanced", q: "What is a materialized view and how does it differ from a regular view?", a: "A regular view is a saved query that runs fresh each time it is accessed. A materialized view stores the query result physically on disk and must be refreshed. Materialized views are faster to query but can be stale — ideal for pre-aggregated reporting tables." },
  ],

  excel: [
    // Basic
    { level: "Basic", q: "What is the difference between VLOOKUP and INDEX/MATCH?", a: "VLOOKUP only looks left-to-right and requires the lookup column to be first. INDEX/MATCH can look in any direction, does not break when columns are inserted, and is faster on large datasets." },
    { level: "Basic", q: "What does a PivotTable do and when should you use one?", a: "A PivotTable dynamically summarizes data by grouping, summing, counting, or averaging without writing formulas. Use it to quickly slice data by categories, compare groups, or build summary reports." },
    { level: "Basic", q: "What is the difference between absolute and relative cell references?", a: "Relative references (A1) adjust when copied. Absolute references ($A$1) stay fixed. Use F4 to toggle. Use absolute references when a formula must always point to a fixed cell like a tax rate." },
    { level: "Basic", q: "What does IFERROR do and what is the difference between IFERROR and IFNA?", a: "IFERROR catches all error types and returns a custom value. IFNA only catches #N/A errors. Use IFNA when you want other errors like #DIV/0! to still surface so real problems are visible." },
    { level: "Basic", q: "What is the difference between COUNT, COUNTA, and COUNTBLANK?", a: "COUNT counts only numeric values. COUNTA counts all non-empty cells including text. COUNTBLANK counts empty cells. Use COUNTA when your data includes text fields you want to count." },
    { level: "Basic", q: "What does SUMIF do and how does it differ from SUMIFS?", a: "SUMIF sums values that meet a single condition: =SUMIF(range, criteria, sum_range). SUMIFS handles multiple conditions: =SUMIFS(sum_range, range1, criteria1, range2, criteria2). Use SUMIFS for multi-condition aggregation." },
    { level: "Basic", q: "What is conditional formatting and when would you use it?", a: "Conditional formatting automatically changes cell appearance based on values or rules — colors, icons, data bars. Use it to highlight outliers, flag negatives, show heat maps, or visually rank data without writing formulas." },
    { level: "Basic", q: "What does the TEXT function do? Give an example.", a: "TEXT converts a number or date to formatted text. Example: =TEXT(A1,'$#,##0.00') displays a number as currency. =TEXT(TODAY(),'MMM DD YYYY') formats today's date as text. Use it when you need formatted values inside concatenated strings." },
    // Intermediate
    { level: "Intermediate", q: "What is Power Query and how does it differ from formulas?", a: "Power Query is a data transformation engine connecting to external sources, cleaning and reshaping data through repeatable steps. Unlike formulas, it handles millions of rows, is auditable, and refreshes automatically from source." },
    { level: "Intermediate", q: "What does XLOOKUP do and how is it better than VLOOKUP?", a: "XLOOKUP searches any range and returns any column — not just to the right. It handles not-found cases natively with a default value argument, works with vertical and horizontal lookups, and does not break when columns shift. Available in Excel 365/2021+." },
    { level: "Intermediate", q: "What is a named range and why would you use one?", a: "A named range assigns a descriptive label to a cell or range (e.g. 'TaxRate' for C2). Formulas using names like =A2*TaxRate are easier to read and maintain than =A2*$C$2. Use them for frequently referenced constants or lookup tables." },
    { level: "Intermediate", q: "What does OFFSET do and when is it useful?", a: "OFFSET returns a reference to a range that is a specified number of rows and columns from a starting cell. Useful for dynamic ranges that grow with data — e.g. creating a chart range that automatically expands when new rows are added." },
    { level: "Intermediate", q: "What is a slicer in Excel and how does it work?", a: "A slicer is a visual filter button panel connected to a PivotTable or Table. Clicking slicer buttons filters the PivotTable interactively. Multiple slicers can be connected to multiple PivotTables simultaneously for dashboard-style filtering." },
    { level: "Intermediate", q: "What is the difference between a Table (Ctrl+T) and a regular range?", a: "An Excel Table auto-expands when rows are added, uses structured references (Table1[Sales]) instead of cell addresses, auto-fills formulas down, and works better with PivotTables and Power Query. Regular ranges require manual updates." },
    // Advanced
    { level: "Advanced", q: "What are array formulas and when do you use them?", a: "Array formulas perform multiple calculations on one or more items in an array. In older Excel, entered with Ctrl+Shift+Enter. In Excel 365, dynamic arrays spill results automatically. Use for multi-condition aggregations, matrix math, or operations that require evaluating entire ranges at once." },
    { level: "Advanced", q: "What is Power Pivot and how does it extend Excel?", a: "Power Pivot is an in-memory data modeling engine inside Excel. It handles tens of millions of rows, creates relationships between tables (like a mini-database), and uses DAX (Data Analysis Expressions) for advanced calculations. It turns Excel into a proper BI tool." },
    { level: "Advanced", q: "What is DAX and name two common DAX functions?", a: "DAX (Data Analysis Expressions) is the formula language for Power Pivot and Power BI. Key functions: CALCULATE() — modifies filter context for a calculation. RELATED() — retrieves values from related tables. It is more powerful than Excel formulas for working across multiple data tables." },
  ],

  tableau: [
    // Basic
    { level: "Basic", q: "What is the difference between a dimension and a measure in Tableau?", a: "Dimensions are categorical fields used to group or slice data (Region, Category). Measures are numeric fields that get aggregated (Sales, Profit). Tableau auto-categorizes but you can override." },
    { level: "Basic", q: "What is a calculated field in Tableau? Give an example.", a: "A calculated field creates a new field using a formula. Example: [Profit Margin] = SUM([Profit]) / SUM([Sales]). It can be used like any other field in visualizations." },
    { level: "Basic", q: "What is the difference between a live connection and an extract?", a: "Live connections query the source in real time — always current but dependent on database speed. Extracts are local snapshots optimized for Tableau — faster but require scheduled refreshes." },
    { level: "Basic", q: "What are filters in Tableau and what is the order of operations?", a: "Tableau applies filters in this order: Extract → Data Source → Context → Sets/Top N → Dimension → Measure → Table Calc → Trend/Reference. Understanding this order explains why a filter may or may not affect a calculation." },
    { level: "Basic", q: "What is a context filter and why would you use one?", a: "A context filter creates a temporary table from filtered data that all other filters and calculations run against. Use it to make Top N filters work correctly — without a context filter, Top N applies before other filters, giving wrong results." },
    { level: "Basic", q: "What is the Marks card and what does each property control?", a: "The Marks card controls how data is visualized. Color encodes a field by hue. Size changes mark size. Label adds text to marks. Detail adds granularity without a visual encoding. Tooltip controls hover text. Shape changes mark shape for scatter plots." },
    { level: "Basic", q: "What is a dashboard in Tableau and how does it differ from a worksheet?", a: "A worksheet is a single visualization. A dashboard combines multiple worksheets and objects (text, images, web pages) into one interactive view. Dashboards support actions — clicking a mark in one chart can filter other charts on the same dashboard." },
    { level: "Basic", q: "What is the difference between discrete and continuous fields in Tableau?", a: "Discrete fields (blue pills) create headers and divide the view into separate sections. Continuous fields (green pills) create axes with a continuous range. Dates can be either — discrete dates group by period, continuous dates plot along an axis." },
    // Intermediate
    { level: "Intermediate", q: "What are LOD expressions and what do FIXED, INCLUDE, and EXCLUDE do?", a: "LOD expressions control calculation granularity independently of the view. FIXED computes at a specified dimension regardless of filters. INCLUDE adds granularity. EXCLUDE removes it from the current view level." },
    { level: "Intermediate", q: "What are Table Calculations and how do they differ from LOD expressions?", a: "Table Calculations compute using data already in the view after aggregation. LOD expressions compute at the data source level before rendering. Table Calculations are ideal for running totals, percent of total, and rank within the view." },
    { level: "Intermediate", q: "What is a parameter in Tableau and how do you use one?", a: "A parameter is a user-controllable input value that can replace a constant in a calculation, filter, or reference line. Example: a parameter letting users choose which metric to display on a chart, used inside a CASE statement in a calculated field." },
    { level: "Intermediate", q: "What is a Set in Tableau and how does it differ from a filter?", a: "A Set is a custom field that defines a subset of members — either fixed (manually selected) or dynamic (condition-based). Unlike filters which remove data, Sets create an in/out field you can use in calculations, colors, and axes to compare the set against everything else." },
    { level: "Intermediate", q: "What does the WINDOW_SUM() function do?", a: "WINDOW_SUM() computes the sum across a window of rows defined by partition and addressing. Example: WINDOW_SUM(SUM([Sales])) sums all values in the current table scope. It is a Table Calculation — different from SUM() which aggregates to the current level of detail." },
    { level: "Intermediate", q: "What is a blended data source in Tableau and when would you use it?", a: "Data blending joins data from two different sources at the aggregate level in the view — unlike joins which happen at the row level. Use blending when your data sources cannot be joined natively, e.g. a database and an Excel file, using a linking field common to both." },
    // Advanced
    { level: "Advanced", q: "What is the difference between FIXED LOD and a context filter?", a: "FIXED LOD ignores all dimension filters unless they are promoted to context filters. A context filter creates a filtered data pool that FIXED LOD respects. If your FIXED LOD is returning unexpected results, check whether you need a context filter to make dimension filters apply." },
    { level: "Advanced", q: "How do dashboard actions work and name three types?", a: "Dashboard actions create interactivity between sheets. Filter actions — clicking a mark filters other sheets. Highlight actions — clicking marks related data. URL actions — clicking opens a web page or passes values to a URL. Set actions — clicking updates a set dynamically." },
    { level: "Advanced", q: "What is a dual axis chart and when would you use one?", a: "A dual axis chart overlays two independent axes on the same view — useful for comparing metrics with different scales on one chart, like revenue (bars) and growth rate (line). Synchronize axes when the scales should align; leave independent when they should not." },
  ],

  python: [
    // Basic
    { level: "Basic", q: "What is the difference between a list and a tuple in Python?", a: "Lists are mutable (can change after creation) using []. Tuples are immutable (cannot change) using (). Use tuples for fixed data like config values. Lists for collections you need to modify." },
    { level: "Basic", q: "What does .groupby() do in Pandas and how does it work?", a: "groupby() splits a DataFrame into groups by one or more columns, applies an aggregation function to each group, then combines results. Example: df.groupby('Region')['Sales'].sum() returns total sales per region." },
    { level: "Basic", q: "What is the difference between .loc[] and .iloc[] in Pandas?", a: ".loc[] selects by label — row index names and column names. .iloc[] selects by integer position — 0-based row and column numbers. Use .loc[] for named indexes, .iloc[] when you need positional slicing like the first 5 rows." },
    { level: "Basic", q: "What does .value_counts() do in Pandas?", a: ".value_counts() returns a Series with counts of unique values, sorted descending by default. Example: df['Region'].value_counts() shows how many rows exist per region. Add normalize=True to get proportions instead of counts." },
    { level: "Basic", q: "What is the difference between .copy() and assignment in Pandas?", a: "Assigning a DataFrame with df2 = df1 creates a view — changes to df2 can affect df1. Using df2 = df1.copy() creates an independent copy. Always use .copy() when you want to modify a subset without affecting the original." },
    { level: "Basic", q: "What does .dropna() do and what are its key parameters?", a: ".dropna() removes rows or columns with missing values. Key params: axis=0 drops rows (default), axis=1 drops columns. how='any' drops if any value is NaN. how='all' drops only if all values are NaN. subset=['col'] limits checking to specific columns." },
    { level: "Basic", q: "What is the difference between .apply() and .map() in Pandas?", a: ".map() works element-wise on a Series — best for simple value substitutions or transformations. .apply() is more flexible — works on Series or DataFrames, row-wise or column-wise, and handles complex logic. .map() is faster for simple cases." },
    { level: "Basic", q: "What is a lambda function and when do you use one?", a: "A lambda is an anonymous single-expression function. Syntax: lambda x: x * 2. Use for short one-off transformations inside .apply(), .map(), or sorted() when a full function definition would be unnecessary overhead." },
    // Intermediate
    { level: "Intermediate", q: "What are list comprehensions and why are they preferred over loops?", a: "List comprehensions build lists in one readable line: [x*2 for x in range(10) if x%2==0]. They are faster than equivalent for-loops because they are C-optimized in Python. Use loops when logic is too complex for one line." },
    { level: "Intermediate", q: "What is the difference between .merge() and .join() in Pandas?", a: ".merge() works like SQL JOINs with explicit control over keys and join type. .join() is a shortcut that joins on index by default. Use .merge() in production pipelines for clarity and control." },
    { level: "Intermediate", q: "What is vectorization in Pandas and why does it matter?", a: "Vectorization applies operations to entire arrays at once using NumPy — 10x-100x faster than .apply() or .iterrows(). Always prefer df['col'] * 2 over row-level loops." },
    { level: "Intermediate", q: "What does .pivot_table() do in Pandas?", a: ".pivot_table() creates a spreadsheet-style pivot summary. Parameters: values (what to aggregate), index (row grouping), columns (column grouping), aggfunc (how to aggregate — default is mean). Example: pd.pivot_table(df, values='Sales', index='Region', columns='Quarter', aggfunc='sum')." },
    { level: "Intermediate", q: "What is the difference between wide and long format data? How do you convert between them?", a: "Wide format has one row per subject with multiple columns for observations. Long format has one row per observation. Use pd.melt() to go wide-to-long (unpivot). Use .pivot() or .pivot_table() to go long-to-wide. Long format is preferred for most analytical tools." },
    { level: "Intermediate", q: "What does pd.concat() do and how is it different from merge?", a: "pd.concat() stacks DataFrames along an axis — vertically (axis=0, adding rows) or horizontally (axis=1, adding columns). merge() combines DataFrames based on matching key values. Use concat() to combine same-schema data from multiple sources." },
    { level: "Intermediate", q: "What are try/except blocks and why are they important in data pipelines?", a: "try/except handles errors gracefully without crashing the program. In data pipelines they catch issues like missing files, bad API responses, or malformed rows. Always catch specific exceptions (FileNotFoundError, ValueError) rather than bare except — bare except hides bugs." },
    { level: "Intermediate", q: "What is the difference between a dictionary and a list in Python?", a: "A list is an ordered sequence accessed by integer index. A dictionary is an unordered (Python 3.7+ preserves insertion order) key-value store accessed by key. Dictionaries have O(1) lookup time. Use dicts when you need fast lookup by a named key rather than position." },
    // Advanced
    { level: "Advanced", q: "What is a generator in Python and when would you use one?", a: "A generator is a function that yields values one at a time using yield instead of returning a list. It uses minimal memory because values are produced on demand. Use generators when processing large files or data streams where loading everything into memory is not feasible." },
    { level: "Advanced", q: "What is the difference between @staticmethod and @classmethod in Python?", a: "@staticmethod does not receive the class or instance — it is a plain function namespaced inside a class. @classmethod receives the class (cls) as its first argument. Use @classmethod for factory methods or when you need to access class-level state." },
    { level: "Advanced", q: "What is method chaining in Pandas and what are its trade-offs?", a: "Method chaining applies multiple operations in sequence: df.dropna().rename(columns={...}).groupby('Region').agg(...).reset_index(). It is readable and avoids intermediate variables. Trade-off: harder to debug because you cannot inspect intermediate states easily. Use .pipe() for complex steps." },
  ],
};

const CODING = {
  sql: [
    { level: "Basic", prompt: "Write a query to find the top 5 customers by total sales.\n\nTable: orders\nColumns: order_id, customer_id, customer_name, sale_amount", solution: "SELECT customer_id, customer_name,\n  SUM(sale_amount) AS total_sales\nFROM orders\nGROUP BY customer_id, customer_name\nORDER BY total_sales DESC\nLIMIT 5;", hint: "Aggregate → group → sort → limit" },
    { level: "Basic", prompt: "Find all customers who have never placed an order.\n\nTables:\n  customers (customer_id, name)\n  orders (order_id, customer_id, order_date)", solution: "SELECT c.customer_id, c.name\nFROM customers c\nLEFT JOIN orders o ON c.customer_id = o.customer_id\nWHERE o.customer_id IS NULL;", hint: "LEFT JOIN + WHERE NULL on the right side = unmatched rows" },
    { level: "Intermediate", prompt: "Rank employees by salary within each department.\n\nTable: employees\nColumns: emp_id, name, department, salary", solution: "SELECT\n  emp_id, name, department, salary,\n  RANK() OVER (\n    PARTITION BY department\n    ORDER BY salary DESC\n  ) AS salary_rank\nFROM employees;", hint: "PARTITION BY groups, ORDER BY sets direction" },
    { level: "Intermediate", prompt: "Calculate a 3-month rolling average of monthly sales.\n\nTable: monthly_sales\nColumns: month (DATE), total_sales", solution: "SELECT\n  month,\n  total_sales,\n  AVG(total_sales) OVER (\n    ORDER BY month\n    ROWS BETWEEN 2 PRECEDING AND CURRENT ROW\n  ) AS rolling_3mo_avg\nFROM monthly_sales\nORDER BY month;", hint: "ROWS BETWEEN 2 PRECEDING AND CURRENT ROW defines the window frame" },
    { level: "Advanced", prompt: "Using a CTE, find customers who ordered in BOTH January AND February 2024.\n\nTable: orders\nColumns: order_id, customer_id, order_date", solution: "WITH jan AS (\n  SELECT DISTINCT customer_id\n  FROM orders\n  WHERE YEAR(order_date) = 2024\n    AND MONTH(order_date) = 1\n),\nfeb AS (\n  SELECT DISTINCT customer_id\n  FROM orders\n  WHERE YEAR(order_date) = 2024\n    AND MONTH(order_date) = 2\n)\nSELECT j.customer_id\nFROM jan j\nINNER JOIN feb f ON j.customer_id = f.customer_id;", hint: "Two CTEs, one per month, INNER JOIN to find overlap" },
    { level: "Advanced", prompt: "Write a query to detect duplicate records in a table.\n\nTable: customers\nColumns: customer_id, email, name\n\nFind emails that appear more than once.", solution: "SELECT\n  email,\n  COUNT(*) AS occurrences,\n  MIN(customer_id) AS keep_id\nFROM customers\nGROUP BY email\nHAVING COUNT(*) > 1\nORDER BY occurrences DESC;", hint: "GROUP BY the duplicate field, HAVING COUNT > 1 finds the dupes" },
  ],
  python: [
    { level: "Basic", prompt: "Write a one-liner list comprehension returning only even numbers squared.\n\nnumbers = [1, 2, 3, 4, 5, 6, 7, 8]\nExpected: [4, 16, 36, 64]", solution: "result = [x**2 for x in numbers if x % 2 == 0]", hint: "Filter with 'if x % 2 == 0', transform with x**2" },
    { level: "Basic", prompt: "Write a function that takes a list of numbers and returns a dict with keys 'mean', 'min', and 'max'.\n\nDo not use Pandas — use Python builtins only.", solution: "def summarize(nums):\n    return {\n        'mean': sum(nums) / len(nums),\n        'min': min(nums),\n        'max': max(nums)\n    }", hint: "sum()/len() for mean, built-in min() and max()" },
    { level: "Intermediate", prompt: "Group a DataFrame by 'Region', return avg Sales and order count per region, sorted by avg_sales descending.\n\nDataFrame: df\nColumns: Region, Sales", solution: "result = (\n  df.groupby('Region')['Sales']\n  .agg(avg_sales='mean', order_count='count')\n  .reset_index()\n  .sort_values('avg_sales', ascending=False)\n)", hint: "Use .agg() with named aggregations, then sort_values" },
    { level: "Intermediate", prompt: "Clean a DataFrame by:\n1. Dropping rows where 'Revenue' is null\n2. Filling 'Region' nulls with 'Unknown'\n3. Removing duplicate rows\n\nDataFrame: df\nColumns: customer_id, Region, Revenue", solution: "df_clean = (\n  df\n  .dropna(subset=['Revenue'])\n  .fillna({'Region': 'Unknown'})\n  .drop_duplicates()\n  .reset_index(drop=True)\n)", hint: "Chain dropna → fillna → drop_duplicates" },
    { level: "Advanced", prompt: "Write a function that reads a CSV, filters rows where 'status' is 'active', groups by 'category', and returns total 'revenue' per category as a dictionary.\n\nUse Pandas. Handle FileNotFoundError gracefully.", solution: "import pandas as pd\n\ndef revenue_by_category(filepath):\n    try:\n        df = pd.read_csv(filepath)\n        result = (\n            df[df['status'] == 'active']\n            .groupby('category')['revenue']\n            .sum()\n            .to_dict()\n        )\n        return result\n    except FileNotFoundError:\n        print(f'File not found: {filepath}')\n        return {}", hint: "try/except wraps read_csv, filter before groupby, .to_dict() at the end" },
  ],
  excel: [
    { level: "Basic", prompt: "Write an Excel formula to look up a customer's region from a reference table.\n\nLookup value: A2\nLookup table: Sheet2!A:C\nRegion is in column 3\nUse exact match", solution: "=VLOOKUP(A2, Sheet2!A:C, 3, FALSE)\n\n-- Preferred (more robust):\n=INDEX(Sheet2!C:C, MATCH(A2, Sheet2!A:A, 0))", hint: "VLOOKUP 4th arg FALSE = exact match. INDEX/MATCH doesn't break on column shifts." },
    { level: "Intermediate", prompt: "Write a formula that returns 'High' if Sales in B2 > 10000, 'Medium' if > 5000, else 'Low'.", solution: '=IF(B2>10000,"High",IF(B2>5000,"Medium","Low"))\n\n-- Excel 2019+ alternative:\n=IFS(B2>10000,"High",B2>5000,"Medium",TRUE,"Low")', hint: "Nested IF evaluates outer condition first. IFS is cleaner for 3+ conditions." },
    { level: "Advanced", prompt: "Write a formula to count the number of unique customers in column A who made a purchase over $500 (column B).\n\nDo not use a helper column.", solution: "=SUMPRODUCT((B2:B100>500)/COUNTIF(A2:A100,A2:A100))\n\n-- Excel 365 alternative:\n=COUNTA(UNIQUE(FILTER(A2:A100, B2:B100>500)))", hint: "SUMPRODUCT with COUNTIF handles unique counting in older Excel. UNIQUE+FILTER in 365." },
  ],
  tableau: [
    { level: "Basic", prompt: "Write a Tableau calculated field for Profit Margin as a percentage.\n\nAvailable fields: [Sales], [Profit]", solution: "SUM([Profit]) / SUM([Sales])\n\n-- Format as Percentage in the Format pane.\n-- Always wrap measures in SUM() to avoid row-level vs aggregate errors.", hint: "Use SUM() around both. Format as % in Format pane." },
    { level: "Intermediate", prompt: "Write a FIXED LOD to calculate each customer's total lifetime sales, independent of view filters.\n\nFields: [Customer ID], [Sales]", solution: "{ FIXED [Customer ID] : SUM([Sales]) }\n\n-- This computes total sales per customer independent of view-level filters.\n-- Promote dimension filters to context if you need them to affect FIXED LODs.", hint: "FIXED ignores view filters. Syntax: { FIXED [dim] : AGG([measure]) }" },
    { level: "Advanced", prompt: "Write a calculated field that classifies each customer as 'High Value', 'Mid Value', or 'Low Value' based on their FIXED lifetime sales:\n  High: > 10000\n  Mid: > 3000\n  Low: otherwise", solution: "IF { FIXED [Customer ID] : SUM([Sales]) } > 10000\nTHEN 'High Value'\nELSEIF { FIXED [Customer ID] : SUM([Sales]) } > 3000\nTHEN 'Mid Value'\nELSE 'Low Value'\nEND", hint: "Nest the FIXED LOD inside an IF/ELSEIF/ELSE block" },
  ],
};

const QUICKFIRE = [
  { q: "What does NULL mean in SQL?", a: "The absence of a value — not zero, not empty string. NULL is unknown." },
  { q: "SQL clause execution order?", a: "FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY → LIMIT" },
  { q: "What does COALESCE do?", a: "Returns the first non-NULL value from a list of arguments." },
  { q: "UNION vs UNION ALL?", a: "UNION removes duplicates. UNION ALL keeps all rows — and is faster." },
  { q: "What is a primary key?", a: "A column that uniquely identifies each row. Cannot be NULL or duplicate." },
  { q: "What is a foreign key?", a: "A column referencing a primary key in another table — enforces referential integrity." },
  { q: "pd.merge() default join type?", a: "Inner join — only rows with matching keys in both DataFrames appear." },
  { q: "What does .fillna() do?", a: "Replaces NaN/NULL values with a specified value or fill method (ffill, bfill)." },
  { q: "Measure vs dimension in Tableau?", a: "Measure = numeric aggregatable (Sales). Dimension = categorical grouping field (Region)." },
  { q: "What does DENSE_RANK() do vs RANK()?", a: "DENSE_RANK gives tied rows the same rank without skipping. RANK() skips the next number." },
  { q: "Absolute cell reference in Excel?", a: "A reference locked with $ signs ($A$1) that does not change when the formula is copied." },
  { q: "VLOOKUP 4th argument?", a: "Exact or approximate match. Use FALSE or 0 for exact match — almost always required." },
  { q: "What is vectorization in Pandas?", a: "Applying operations to entire arrays at once via NumPy — 10-100x faster than row loops." },
  { q: "What is an index in SQL?", a: "A data structure that speeds up retrieval by providing fast lookup paths — like a book index." },
  { q: "What does GROUP BY do?", a: "Groups rows sharing the same value so aggregate functions can be applied per group." },
  { q: "What is a CTE?", a: "Common Table Expression — a named temporary result set defined with WITH for readability and reuse." },
  { q: "What does LAG() do in SQL?", a: "Accesses the value from a previous row in the result set. Used for period-over-period comparisons." },
  { q: "What is the difference between .loc and .iloc?", a: ".loc uses label-based indexing (column/row names). .iloc uses integer-position indexing (0-based)." },
  { q: "What is a context filter in Tableau?", a: "A filter that creates a temporary data pool all other filters run against. Required for correct Top N filtering." },
  { q: "What does IFERROR do in Excel?", a: "Wraps a formula and returns a custom value if it produces any error type — keeps dashboards clean." },
  { q: "What is a LEFT JOIN?", a: "Returns all rows from the left table plus matching rows from the right. NULLs where no match exists." },
  { q: "What is normalization?", a: "Organizing tables to reduce redundancy by splitting data into related tables with clear relationships." },
  { q: "What does .dropna() do?", a: "Removes rows (or columns) containing NaN/NULL values. Control with axis, how, and subset params." },
  { q: "What is XLOOKUP?", a: "Excel 365 function that replaces VLOOKUP — searches any direction, handles not-found natively, doesn't break on column shifts." },
  { q: "What is a materialized view?", a: "A view that stores its query result physically on disk for fast reads — must be refreshed to stay current." },
];

// ── DOMAIN PACKS ──────────────────────────────────────────────────────────────

const DOMAIN_PACKS = {
  boeing: {
    id: "boeing",
    label: "Boeing / Aviation",
    icon: "✈",
    color: "#60a5fa",
    description: "Workforce analytics, maintenance data, flight operations, reliability reporting",
    questions: [
      // Basic
      { level: "Basic", q: "You have a table of aircraft maintenance events with columns: tail_number, event_date, event_type, hours_down. Write a query to find the total downtime hours per aircraft, sorted by most downtime.", a: "SELECT tail_number, SUM(hours_down) AS total_downtime FROM maintenance_events GROUP BY tail_number ORDER BY total_downtime DESC;\n\nThis is a straightforward aggregation. The key is grouping by the unit of analysis (aircraft tail number) and ordering descending to surface the worst performers first." },
      { level: "Basic", q: "What is schedule reliability in aviation analytics and how would you calculate it from a flight operations table?", a: "Schedule reliability = percentage of flights departing within X minutes of scheduled time (typically 15 min). Formula: (on_time_departures / total_departures) * 100. Query: SELECT COUNT(CASE WHEN ABS(actual_dep - scheduled_dep) <= 15 THEN 1 END) * 100.0 / COUNT(*) AS reliability_pct FROM flights." },
      { level: "Basic", q: "A production manager wants to see the daily build rate for a 777 line. Your table has: work_order_id, unit_number, start_date, completion_date. What metric do you calculate and how?", a: "Calculate units completed per day (build rate). SELECT completion_date, COUNT(unit_number) AS units_completed FROM work_orders WHERE completion_date IS NOT NULL GROUP BY completion_date ORDER BY completion_date. Then compute a rolling average to smooth daily variance: AVG(units_completed) OVER (ORDER BY completion_date ROWS BETWEEN 6 PRECEDING AND CURRENT ROW) as rolling_7day_rate." },
      { level: "Basic", q: "What is JBS (Job Build Schedule) and why is reducing JBS slippage important as a metric?", a: "JBS tracks whether individual work orders complete within their scheduled time window on the production line. Slippage means a job took longer than planned, cascading delays to downstream operations. Reducing JBS slippage improves line flow, reduces overtime costs, and maintains on-time delivery commitments. As an analyst you'd measure: (actual_completion - scheduled_completion) in hours, then aggregate by work center, shift, or job type to find root cause patterns." },
      { level: "Basic", q: "You have a parts inventory table: part_number, quantity_on_hand, unit_cost, reorder_point. Write a query to flag parts below reorder point and calculate total dollar exposure.", a: "SELECT part_number, quantity_on_hand, reorder_point, unit_cost, (reorder_point - quantity_on_hand) * unit_cost AS dollar_exposure FROM inventory WHERE quantity_on_hand < reorder_point ORDER BY dollar_exposure DESC;\n\nThe dollar exposure calculation helps prioritize which stockouts need immediate attention vs. low-cost items that can wait." },
      { level: "Basic", q: "What is MTBF (Mean Time Between Failures) and how would you calculate it from a maintenance events table?", a: "MTBF = total operating hours / number of failures. It measures reliability — higher MTBF means fewer unplanned failures. SQL: SELECT component_type, SUM(operating_hours) / COUNT(failure_events) AS mtbf_hours FROM maintenance_log WHERE event_type = 'unplanned' GROUP BY component_type. Used to plan preventive maintenance intervals and compare fleet reliability over time." },
      { level: "Basic", q: "A supervisor asks for a report showing each mechanic's work order completion rate this month. What query structure do you use?", a: "SELECT m.mechanic_id, m.name, COUNT(wo.work_order_id) AS assigned, SUM(CASE WHEN wo.status = 'complete' THEN 1 ELSE 0 END) AS completed, ROUND(SUM(CASE WHEN wo.status = 'complete' THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 1) AS completion_rate FROM mechanics m JOIN work_orders wo ON m.mechanic_id = wo.assigned_to WHERE MONTH(wo.due_date) = MONTH(CURRENT_DATE) GROUP BY m.mechanic_id, m.name ORDER BY completion_rate DESC." },
      { level: "Basic", q: "What is inventory turnover and why does it matter in an aerospace manufacturing context?", a: "Inventory turnover = Cost of Goods Sold / Average Inventory Value. In aerospace manufacturing, high turnover means parts move through efficiently without excessive stockpiling (which ties up capital and creates obsolescence risk). Low turnover may indicate overstocking, demand forecast errors, or supplier delivery mismatches. An 8% inventory cost reduction (like reducing excess buffer stock) directly improves this metric." },
      { level: "Basic", q: "You need to compare planned vs. actual labor hours by work center for the current quarter. What columns and aggregation logic do you need?", a: "SELECT work_center, SUM(planned_hours) AS planned, SUM(actual_hours) AS actual, SUM(actual_hours) - SUM(planned_hours) AS variance, ROUND((SUM(actual_hours) - SUM(planned_hours)) / SUM(planned_hours) * 100, 1) AS variance_pct FROM labor_records WHERE quarter = CURRENT_QUARTER GROUP BY work_center ORDER BY variance_pct DESC. Positive variance = over plan (problem). Negative = under plan (efficiency or incomplete work)." },
      { level: "Basic", q: "What does a Gantt chart represent in project analytics, and what data structure underlies it?", a: "A Gantt chart shows tasks on a timeline with start date, end date, duration, and dependencies. The underlying data structure: task_id, task_name, start_date, end_date, predecessor_task_id, percent_complete, assigned_resource. In SQL you'd need self-joins or recursive CTEs to traverse the dependency chain. Analysts use it to identify the critical path — the longest chain of dependent tasks that determines minimum project duration." },
      // Intermediate
      { level: "Intermediate", q: "Write a SQL query to calculate the 30-day rolling average of unplanned maintenance events per aircraft tail number. Table: maintenance_events (tail_number, event_date, event_type).", a: "SELECT tail_number, event_date, COUNT(*) OVER (\n  PARTITION BY tail_number\n  ORDER BY event_date\n  ROWS BETWEEN 29 PRECEDING AND CURRENT ROW\n) AS rolling_30day_unplanned\nFROM maintenance_events\nWHERE event_type = 'unplanned'\nORDER BY tail_number, event_date;\n\nThe window frame ROWS BETWEEN 29 PRECEDING AND CURRENT ROW gives exactly 30 days of history including today." },
      { level: "Intermediate", q: "Your production data shows work orders are consistently slipping on Wing Assembly but not on Final Assembly. How do you structure an analysis to find root cause?", a: "Segment the problem: (1) Filter maintenance_events to Wing Assembly, group by shift, mechanic_team, job_type to find if slippage is concentrated. (2) Correlate with part shortages — join to inventory events on same dates. (3) Check rework rates: jobs with rework flags tend to cascade delays. (4) Compare pre/post any staffing or tooling changes using a before/after date filter. Present findings as: 60% of slippage concentrated in 3 job types → drill into those job types for root cause." },
      { level: "Intermediate", q: "You need to find aircraft that had both a maintenance event AND a schedule disruption within 48 hours of each other. How do you write this query?", a: "SELECT m.tail_number, m.event_date AS maintenance_date, f.flight_date AS disruption_date, DATEDIFF(f.flight_date, m.event_date) AS hours_gap\nFROM maintenance_events m\nJOIN flight_disruptions f ON m.tail_number = f.tail_number\n  AND f.flight_date BETWEEN m.event_date AND DATE_ADD(m.event_date, INTERVAL 48 HOUR)\nWHERE m.event_type = 'unplanned'\nORDER BY m.tail_number, m.event_date;\n\nThis is a non-equi join with a date range condition — common in operations analytics." },
      { level: "Intermediate", q: "How would you build a Tableau dashboard to monitor production line health for a 777 build program? What views would you include?", a: "Key views: (1) Build rate trend — line chart of units completed per week vs. plan. (2) JBS slippage by work center — bar chart with reference line at zero. (3) Top 10 work orders by delay hours — table with drill-down. (4) Labor efficiency — actual vs. planned hours heatmap by shift/day. (5) Part shortage tracker — flagged items with days of supply remaining. Use color coding: green = on plan, yellow = within 5%, red = >5% off. Add filter actions so clicking a work center filters all other views." },
      { level: "Intermediate", q: "What is a LOD expression in Tableau and give a real aviation analytics use case for FIXED.", a: "LOD expressions compute at a granularity you specify, independent of what's in the view. FIXED ignores all dimension filters. Aviation use case: calculating each aircraft's average unplanned events per month regardless of what date range filter the user applies — { FIXED [Tail Number] : AVG([Monthly_Unplanned_Events]) }. This gives a fleet baseline you can compare each aircraft against, even when the user filters to just the last 30 days." },
      { level: "Intermediate", q: "You have 3 years of maintenance data. Leadership wants to know if fleet reliability is improving, holding steady, or degrading. How do you structure this analysis in Python?", a: "import pandas as pd\n\ndf = pd.read_csv('maintenance.csv', parse_dates=['event_date'])\ndf['year_month'] = df['event_date'].dt.to_period('M')\n\n# Monthly unplanned events per aircraft\nmonthly = df[df['event_type']=='unplanned'].groupby('year_month').agg(\n  events=('event_id','count'),\n  fleet_size=('tail_number','nunique')\n).reset_index()\n\nmonthly['events_per_aircraft'] = monthly['events'] / monthly['fleet_size']\nmonthly['rolling_3mo'] = monthly['events_per_aircraft'].rolling(3).mean()\n\n# Trend: compare first year avg vs last year avg\nfirst_yr = monthly.head(12)['events_per_aircraft'].mean()\nlast_yr = monthly.tail(12)['events_per_aircraft'].mean()\nprint(f'Trend: {((last_yr-first_yr)/first_yr)*100:.1f}% change')" },
      { level: "Intermediate", q: "Explain what a waterfall chart shows and describe a Boeing production use case where it would be the right visualization.", a: "A waterfall chart shows how an initial value increases or decreases through a series of intermediate steps to reach a final value. Each bar shows a positive or negative contribution. Boeing use case: showing how the planned 777 build rate of 5 units/month changes to actual 3.8 units/month — broken down by: part shortages (-0.4), rework events (-0.3), tool availability (-0.2), labor callouts (-0.3). Each factor is a bar. Leadership sees exactly which contributors drove the gap, not just the total variance." },
      { level: "Intermediate", q: "Your inventory reduction project claims an 8% cost reduction. How do you validate and measure this in SQL?", a: "Compare average inventory value before and after the project:\nWITH before AS (\n  SELECT AVG(quantity_on_hand * unit_cost) AS avg_inv_value\n  FROM inventory_snapshots\n  WHERE snapshot_date BETWEEN '2022-01-01' AND '2022-12-31'\n),\nafter AS (\n  SELECT AVG(quantity_on_hand * unit_cost) AS avg_inv_value\n  FROM inventory_snapshots\n  WHERE snapshot_date BETWEEN '2023-01-01' AND '2023-12-31'\n)\nSELECT before.avg_inv_value, after.avg_inv_value,\n  (after.avg_inv_value - before.avg_inv_value) / before.avg_inv_value * 100 AS pct_change\nFROM before, after;\n\nAlso validate: same period comparison eliminates seasonality. Compare to control group if available." },
      { level: "Intermediate", q: "What Python library would you use to build a predictive model for unplanned maintenance events, and what features would you engineer from raw maintenance data?", a: "Use scikit-learn. Features to engineer from maintenance data: days_since_last_event (recency), rolling_30day_event_count (frequency), aircraft_age_years, total_flight_hours, component_type_encoded, seasonal_month, days_since_last_inspection. Target variable: unplanned_event_next_30_days (binary). Model: Random Forest or Gradient Boosting (handles non-linear relationships, works with mixed feature types). Validate with time-based train/test split — never shuffle, always split chronologically to avoid data leakage." },
      { level: "Intermediate", q: "How would you use Excel Power Query to consolidate monthly maintenance reports from 12 different work centers into a single analysis-ready table?", a: "In Power Query: (1) Get Data → Folder → point to the folder with all 12 files. (2) Power Query auto-generates a function to load each file. (3) Add a custom column to tag each row with the source filename (work center name). (4) Filter out header rows that repeated across files. (5) Standardize column names using Rename Columns. (6) Set correct data types. (7) Load to Excel table. Key advantage: when new monthly files drop into the folder, click Refresh and the table updates automatically — no manual copy-paste." },
      // Advanced
      { level: "Advanced", q: "Design a data pipeline in Python that ingests daily work order exports from a Boeing MES (Manufacturing Execution System), detects JBS slippage anomalies, and alerts operations managers via a dashboard flag. Walk through the architecture.", a: "Architecture: (1) Ingestion — scheduled Python script (cron/Airflow) reads daily CSV export, validates schema (column presence, date formats, null checks). (2) Transformation — pandas: parse dates, calculate planned vs actual hour variance per work order, flag outliers using z-score or IQR method on historical variance distribution. (3) Storage — write clean data + flags to PostgreSQL staging table. (4) Dashboard — Tableau/Power BI reads from DB, shows red flags on work center heatmap. (5) Alerting — if flagged work orders > threshold, trigger email via SMTP or Slack API. Key design decision: idempotent inserts (ON CONFLICT UPDATE) so re-runs don't duplicate data." },
      { level: "Advanced", q: "You need to build a fleet reliability scoring model that ranks aircraft by risk of unplanned maintenance in the next 30 days. What's your end-to-end approach?", a: "Step 1 — Define target: binary label (unplanned event in next 30 days = 1/0) on rolling monthly windows per aircraft. Step 2 — Feature engineering: recency (days since last unplanned), frequency (events per 100 flight hours), aircraft age, component-level MTBF vs fleet average, seasonal effects. Step 3 — Model: Gradient Boosting (XGBoost) — handles non-linear interactions, outputs probability. Step 4 — Validation: time-series cross-validation (expanding window), evaluate precision/recall at threshold that minimizes missed high-risk aircraft. Step 5 — Deployment: score runs nightly, results push to Tableau dashboard as risk tier (High/Medium/Low) per tail number. Step 6 — Monitor: track model calibration monthly, retrain quarterly." },
      { level: "Advanced", q: "How do you handle slowly changing dimensions in an aviation analytics data warehouse? Give a specific example from fleet or workforce data.", a: "Slowly Changing Dimensions (SCDs) track how dimension attributes change over time. Type 2 SCD is most common in aviation analytics. Example: An aircraft (tail_number) gets reassigned from Domestic to International operations. Type 2 handles this by: adding start_date and end_date columns plus an is_current flag. Old record: end_date set, is_current = false. New record: same tail_number, new operation_type, start_date = reassignment date, end_date = NULL, is_current = true. This preserves historical accuracy — maintenance events before the reassignment correctly join to the 'Domestic' record, not the current 'International' record. Critical for correct trend analysis." },
      { level: "Advanced", q: "A Tableau dashboard is running slowly when users filter by date range on a fleet of 800 aircraft with 5 years of daily data. What are 5 concrete steps to improve performance?", a: "(1) Switch from live connection to extract — daily scheduled refresh is fine for operations dashboards. (2) Pre-aggregate in the data source — instead of row-level daily events, create a summary table at weekly/monthly grain. (3) Use context filters — promote the date filter to context so it runs first and reduces the data pool. (4) Reduce LOD expression scope — if FIXED LODs are computing across 5 years, add a date constraint inside the LOD. (5) Limit marks — cap scatter plots at 5,000 marks max, use aggregated views for overview, drill-down only on demand. Also: check if data blending is happening (expensive) and replace with a join in the data source." },
      { level: "Advanced", q: "Walk through how you would build a Python-based anomaly detection system for production quality metrics on a 777X assembly line.", a: "import pandas as pd\nfrom scipy import stats\nimport numpy as np\n\ndef detect_anomalies(df, metric_col, window=30, threshold=3):\n    df = df.sort_values('date')\n    df['rolling_mean'] = df[metric_col].rolling(window).mean()\n    df['rolling_std'] = df[metric_col].rolling(window).std()\n    df['z_score'] = (df[metric_col] - df['rolling_mean']) / df['rolling_std']\n    df['is_anomaly'] = df['z_score'].abs() > threshold\n    return df\n\n# Usage: detect defect rate spikes\nresult = detect_anomalies(quality_df, 'defect_rate_pct')\nalerts = result[result['is_anomaly']]\nprint(f'{len(alerts)} anomalies detected')\n\nFor production: use CUSUM (cumulative sum) or EWMA (exponentially weighted moving average) for earlier detection of gradual drift — z-score catches spikes but misses slow degradation." },
      { level: "Advanced", q: "What is a star schema and design one for a Boeing production analytics warehouse that supports build rate, labor efficiency, and quality reporting.", a: "A star schema has one central fact table surrounded by dimension tables — no joins between dimensions. Design:\n\nFACT_PRODUCTION: work_order_id (FK), date_id (FK), work_center_id (FK), employee_id (FK), part_id (FK), planned_hours, actual_hours, defects_found, units_completed\n\nDIM_DATE: date_id, date, week, month, quarter, year, shift\nDIM_WORK_CENTER: work_center_id, name, line, building, manager\nDIM_EMPLOYEE: employee_id, name, skill_code, grade, team\nDIM_PART: part_id, part_number, description, category, unit_cost\n\nThis supports: build rate (aggregate units_completed by date), labor efficiency (sum planned vs actual hours by work_center), quality (sum defects by part/work_center). Queries are simple and fast because every analysis is just FACT + one or two DIM joins." },
      { level: "Advanced", q: "You inherit a 15,000-line Excel workbook used for production scheduling at Boeing. Leadership wants it replaced with a proper data solution. How do you approach this migration project?", a: "Phase 1 — Discovery (2 weeks): interview users to understand every tab's purpose, identify inputs vs. outputs, map data sources feeding the workbook. Document all formulas and business rules. Identify the 20% of functionality that drives 80% of decisions. Phase 2 — Design (1 week): choose target stack (SQL database + Python ETL + Tableau or Power BI dashboard). Design data model. Phase 3 — Build parallel (4 weeks): build new solution, run both in parallel, validate outputs match. Phase 4 — Training and cutover (1 week): train users, document new system, decommission Excel after sign-off. Critical success factors: get a power user as champion, don't try to replicate every feature — simplify. Biggest risk: undocumented business logic buried in nested IF formulas." },
      { level: "Advanced", q: "Explain how you would use Python pandas to perform a cohort analysis on Boeing mechanics — tracking first-year retention and productivity by hire cohort.", a: "import pandas as pd\n\n# Load employee data\ndf = pd.read_csv('employees.csv', parse_dates=['hire_date', 'term_date'])\ndf['hire_cohort'] = df['hire_date'].dt.to_period('Q')  # quarterly cohorts\ndf['tenure_days'] = (df['term_date'].fillna(pd.Timestamp.today()) - df['hire_date']).dt.days\ndf['retained_365'] = (df['tenure_days'] >= 365).astype(int)\n\n# Retention by cohort\nretention = df.groupby('hire_cohort').agg(\n  hired=('employee_id','count'),\n  retained_1yr=('retained_365','sum')\n).reset_index()\nretention['retention_rate'] = retention['retained_1yr'] / retention['hired'] * 100\n\n# Join to productivity data for productivity analysis\n# Cohorts with lower retention often show lower productivity in months 6-12\nprint(retention)" },
      { level: "Basic", q: "What is a Gantt chart and how is it used in aerospace production planning? What data fields power one?", a: "A Gantt chart is a horizontal bar chart showing tasks, their durations, and dependencies over time. In aerospace production planning it shows each work order, which work center it runs in, planned start/end dates, and predecessor tasks. Data needed: work_order_id, task_name, work_center, planned_start, planned_end, actual_start, actual_end, predecessor_task_id. Critical path tasks — those where any delay pushes the final delivery date — are highlighted. In Tableau you can build a Gantt using a calculated field for duration: DATEDIFF('day', planned_start, planned_end) placed on the Size shelf." },
      { level: "Basic", q: "You're asked to create a headcount forecast for the 777X production ramp. What data sources and calculation approach would you use?", a: "Data sources: current headcount by work center and skill code, historical units-per-employee ratios by line rate, upcoming production schedule (units per month), planned overtime caps, and attrition rates by classification. Approach: (1) Determine required labor hours = planned_units × hours_per_unit by work center. (2) Convert to FTE: required_hours / available_hours_per_FTE (accounting for PTO, training, utilization). (3) Subtract current headcount to get net hire/reduction needed. (4) Apply attrition rate to existing headcount to get replacement hiring. (5) Model in Excel or Python with scenario toggles for production rate changes. Present as a waterfall: starting headcount → attrition → transfers → new hires → ending headcount." },
      { level: "Intermediate", q: "What is a learning curve in aerospace manufacturing and how would you model it in SQL or Python?", a: "A learning curve (Wright's Law) states that each time cumulative production doubles, unit labor hours decrease by a fixed percentage (e.g. 80% curve means each doubling = 20% reduction). Model in Python:\nimport numpy as np\n\ndef learning_curve(unit_number, first_unit_hours, learning_rate=0.8):\n    # T(n) = T(1) * n^(log(learning_rate)/log(2))\n    b = np.log(learning_rate) / np.log(2)\n    return first_unit_hours * (unit_number ** b)\n\nunits = range(1, 501)\nforecasted_hours = [learning_curve(u, first_unit_hours=10000) for u in units]\n\nIn SQL, validate actual vs. modeled: compare actual_hours_per_unit to the curve forecast by unit_number to see if the line is on, ahead, or behind the learning curve. Deviation above the curve = rework, tooling issues, or workforce disruption." },
      { level: "Intermediate", q: "Your team lead asks you to build a KPI dashboard for the 777 production line. Name 6 KPIs, their calculation, and what a healthy target looks like for each.", a: "(1) Build Rate: units completed per month. Target: ≥ plan (e.g. 5/month). (2) JBS Adherence: % work orders completing within scheduled window. Target: ≥ 95%. (3) Labor Efficiency: planned hours / actual hours × 100. Target: 95–105% (under 90% = efficiency problem, over 110% = unrealistic plans). (4) First-Pass Quality: % units passing inspection without rework. Target: ≥ 98%. (5) Parts Availability: % work orders able to start on schedule due to parts availability. Target: ≥ 97%. (6) Inventory Turnover: COGS / average inventory. Target varies by part category — high-turn for consumables, lower for rotables. Dashboard: red/yellow/green traffic light for each KPI vs. target, trend sparkline for last 12 weeks, drill-down by work center." },
      { level: "Advanced", q: "You notice that after Boeing's 2020 workforce reduction, the JBS slippage metric increased significantly in 2021. Walk through a root cause analysis approach using data.", a: "Step 1 — Confirm the signal: plot JBS slippage % by month 2019-2022. Is the increase statistically significant (control chart, not just noise)? Step 2 — Segment the problem: break slippage by work center, job type, skill code. Is it everywhere or concentrated? Step 3 — Hypothesis: workforce reduction → loss of experienced mechanics → longer task times. Test with SQL: join work order slippage data to workforce data, correlate slippage rate with average_tenure_of_workforce and experience_ratio (senior/junior) by work center and month. Step 4 — Control for confounders: was there also a production rate change, new aircraft variant, tooling upgrades? Use multiple regression to isolate workforce effect. Step 5 — Quantify: for each 1% drop in average workforce tenure, what's the predicted increase in JBS slippage? Step 6 — Recommendation: targeted retention bonuses for senior mechanics in high-slippage work centers, accelerated mentoring programs." },
    ]
  },

  retail: {
    id: "retail",
    label: "Retail / Operations",
    icon: "🛒",
    color: "#34d399",
    description: "Supply chain analytics, fulfillment KPIs, inventory management, customer metrics",
    questions: [
      // Basic
      { level: "Basic", q: "What is on-time fulfillment rate and how would you calculate it from an orders table? Table: orders (order_id, order_date, promised_date, shipped_date).", a: "On-time fulfillment rate = orders shipped on or before promised date / total orders. SELECT COUNT(CASE WHEN shipped_date <= promised_date THEN 1 END) * 100.0 / COUNT(*) AS otf_rate FROM orders WHERE shipped_date IS NOT NULL. Filter to shipped_date IS NOT NULL to exclude open orders from the denominator. Track by store, region, and carrier to find where fulfillment is breaking down." },
      { level: "Basic", q: "What is inventory turnover and how do you calculate it? Why does a grocery pickup operation care about this metric?", a: "Inventory turnover = Cost of Goods Sold / Average Inventory Value. A grocery pickup operation cares intensely because perishables have a shelf life — low turnover means product is sitting too long and will spoil, causing both waste cost and stockout risk for customers. Target turnover varies by category: produce might turn weekly, dry goods monthly. SQL: SELECT category, SUM(cogs) / AVG(inventory_value) AS turnover FROM inventory_summary GROUP BY category." },
      { level: "Basic", q: "A store manager asks: which products had zero units sold in the last 30 days despite having inventory? Write the SQL.", a: "SELECT i.product_id, i.product_name, i.units_on_hand\nFROM inventory i\nLEFT JOIN sales s ON i.product_id = s.product_id\n  AND s.sale_date >= CURRENT_DATE - INTERVAL 30 DAY\nWHERE s.product_id IS NULL\n  AND i.units_on_hand > 0\nORDER BY i.units_on_hand DESC;\n\nThis is a classic LEFT JOIN + WHERE NULL pattern — finds products in inventory with no matching sales record in the 30-day window." },
      { level: "Basic", q: "What is a stockout and how would you flag products at risk of stocking out in a SQL query? Table: inventory (product_id, units_on_hand, avg_daily_demand).", a: "A stockout is when inventory hits zero and demand goes unmet — lost sales and a poor customer experience. Flag at-risk items: SELECT product_id, units_on_hand, avg_daily_demand, ROUND(units_on_hand / NULLIF(avg_daily_demand, 0), 1) AS days_of_supply FROM inventory WHERE units_on_hand / NULLIF(avg_daily_demand, 0) < 7 ORDER BY days_of_supply ASC. Items with less than 7 days of supply need replenishment action. NULLIF prevents divide-by-zero on items with zero demand." },
      { level: "Basic", q: "What does average order value (AOV) measure and how do you track it trending week over week in SQL?", a: "AOV = Total Revenue / Number of Orders. It measures how much customers spend per transaction. Week-over-week tracking: SELECT DATE_TRUNC('week', order_date) AS week, COUNT(DISTINCT order_id) AS orders, SUM(order_value) AS revenue, SUM(order_value) / COUNT(DISTINCT order_id) AS aov FROM orders GROUP BY week ORDER BY week. Use LAG() window function to add a WoW change column: LAG(aov) OVER (ORDER BY week) gives the prior week's AOV for comparison." },
      { level: "Basic", q: "Explain the difference between sell-through rate and inventory turnover. When would you use each?", a: "Sell-through rate = units sold / (units sold + units on hand) — measures what percentage of inventory was sold in a period. Inventory turnover = COGS / average inventory value — measures how many times inventory cycles through. Use sell-through for promotional analysis (did the sale clear inventory?) and seasonal planning (what % of summer items sold before fall?). Use turnover for financial efficiency and supply chain planning. Both together give a complete inventory health picture." },
      { level: "Basic", q: "What is a pivot table and give a real retail use case where you'd use one in Excel?", a: "A pivot table dynamically summarizes large datasets by grouping and aggregating without formulas. Retail use case: You have 500,000 rows of transaction data with columns: date, store_id, category, product, units, revenue. Create a pivot table with category in rows, month in columns, and SUM of revenue as values. Instantly see which categories grew or declined month-over-month across all stores. Add store_id as a slicer to filter to one region. What would take hours of SUMIF formulas takes 30 seconds with a pivot." },
      { level: "Basic", q: "What is a fill rate in supply chain analytics and how does it differ from on-time delivery?", a: "Fill rate = percentage of demand fulfilled from available stock (no backorders, no substitutions). Formula: units shipped / units ordered. On-time delivery = percentage of orders delivered by promised date. They measure different things: Fill rate is about completeness (did we have the product?). On-time delivery is about timing (did it arrive when promised?). You can have high fill rate but poor on-time (always ship complete but late). Or high on-time but low fill rate (arrive on time but only partial shipment)." },
      { level: "Basic", q: "You're analyzing grocery pickup wait times. Table: pickups (pickup_id, ordered_at, ready_at, picked_up_at). Write a query to find average wait time after the order is ready, by hour of day.", a: "SELECT HOUR(ready_at) AS hour_of_day,\n  AVG(TIMESTAMPDIFF(MINUTE, ready_at, picked_up_at)) AS avg_wait_minutes,\n  COUNT(*) AS pickup_count\nFROM pickups\nWHERE picked_up_at IS NOT NULL\n  AND picked_up_at >= ready_at\nGROUP BY HOUR(ready_at)\nORDER BY hour_of_day;\n\nThis reveals peak-hour congestion. The WHERE clause filters out data quality issues (pickup before ready time)." },
      { level: "Basic", q: "What is customer lifetime value (CLV) at a conceptual level and why do retail operations analysts care about it?", a: "CLV = predicted total revenue a customer will generate over their relationship with the company. Simple formula: CLV = Average Order Value × Purchase Frequency × Customer Lifespan. Operations analysts care because it drives prioritization decisions: if a high-CLV customer has a bad pickup experience, the cost is much higher than for a one-time shopper. It also informs how much to invest in fixing operational failures — a $50 compensation coupon makes sense for a customer worth $2,000 lifetime, not for one worth $50." },
      // Intermediate
      { level: "Intermediate", q: "Write a SQL query to identify the top 20% of customers by revenue (Pareto analysis) and what percentage of total revenue they represent.", a: "WITH customer_rev AS (\n  SELECT customer_id, SUM(order_value) AS total_rev\n  FROM orders GROUP BY customer_id\n),\nranked AS (\n  SELECT *, NTILE(5) OVER (ORDER BY total_rev DESC) AS quintile\n  FROM customer_rev\n)\nSELECT\n  SUM(CASE WHEN quintile = 1 THEN total_rev END) AS top_20pct_rev,\n  SUM(total_rev) AS all_rev,\n  ROUND(SUM(CASE WHEN quintile = 1 THEN total_rev END) / SUM(total_rev) * 100, 1) AS pct_of_total\nFROM ranked;\n\nNTILE(5) splits customers into 5 equal groups by revenue. Quintile 1 = top 20%. The classic Pareto finding: top 20% of customers typically drive 60-80% of revenue." },
      { level: "Intermediate", q: "Your grocery pickup store sees a spike in substitution rate on Tuesdays. How do you structure an analysis to find root cause?", a: "Substitution rate = orders with at least one substituted item / total orders. Structure: (1) Confirm the Tuesday pattern — group by day of week for last 12 weeks, verify it's consistent not random. (2) Which product categories have highest Tuesday substitution? — join to product categories, find if it's produce, dairy, or specific SKUs. (3) Is it a receiving day issue? — check if Tuesday is a slow receiving day (fewer trucks = depleted stock by picking time). (4) Is it pickers or inventory? — if the same items are substituted but in-stock per inventory system, it's a picker behavior issue. Present as hypothesis tree: confirmed pattern → category concentration → supply or process root cause." },
      { level: "Intermediate", q: "Design a Tableau dashboard for a grocery pickup operations manager. What KPIs and views would you include?", a: "Header KPIs (daily): On-Time Fulfillment Rate, Substitution Rate, Average Pick Time (minutes), Orders Completed, Substitution Rate vs. last week. Main views: (1) Hourly order volume vs. staffing capacity — bar/line combo chart. (2) Fulfillment rate by product category — sorted bar chart. (3) Pick time distribution — histogram to spot outliers. (4) Top 20 most-substituted items this week — table with units substituted and reason code. (5) Trend line: 13-week fulfillment rate with target reference line. Design principle: manager needs to know in 30 seconds if today is on track or needs intervention." },
      { level: "Intermediate", q: "What is cohort analysis in a retail context and how would you use Python pandas to build a customer retention cohort?", a: "Cohort analysis groups customers by when they first purchased and tracks their behavior over subsequent periods. In retail: do customers acquired in Q1 retain better than Q4 holiday shoppers?\n\nimport pandas as pd\ndf = pd.read_csv('orders.csv', parse_dates=['order_date'])\ndf['cohort'] = df.groupby('customer_id')['order_date'].transform('min').dt.to_period('M')\ndf['order_period'] = df['order_date'].dt.to_period('M')\ndf['period_number'] = (df['order_period'] - df['cohort']).apply(lambda x: x.n)\n\ncohort_data = df.groupby(['cohort','period_number'])['customer_id'].nunique().reset_index()\ncohort_pivot = cohort_data.pivot(index='cohort', columns='period_number', values='customer_id')\nretention = cohort_pivot.divide(cohort_pivot[0], axis=0) * 100\nprint(retention)" },
      { level: "Intermediate", q: "Explain the difference between ABC analysis and XYZ analysis in inventory management and how you'd combine them.", a: "ABC analysis classifies by value: A items = top 70-80% of revenue (typically 10-20% of SKUs), B = next 15-25%, C = bottom 5-10% of revenue but most SKUs. XYZ analysis classifies by demand variability: X = stable predictable demand (low variance), Y = moderate variability, Z = highly variable or sporadic demand. Combine them: AX items (high value, predictable) → tight inventory control, frequent replenishment. CZ items (low value, unpredictable) → keep buffer stock or consider dropping. AZ items (high value but unpredictable) → most dangerous — need safety stock and close monitoring. This matrix drives replenishment strategy per SKU class." },
      { level: "Intermediate", q: "Write a Python function that takes a DataFrame of daily sales and flags weeks where sales dropped more than 15% week-over-week for any product.", a: "import pandas as pd\n\ndef flag_sales_drops(df, threshold=0.15):\n    df = df.copy()\n    df['week'] = pd.to_datetime(df['date']).dt.to_period('W')\n    weekly = df.groupby(['product_id','week'])['units_sold'].sum().reset_index()\n    weekly = weekly.sort_values(['product_id','week'])\n    weekly['prev_week'] = weekly.groupby('product_id')['units_sold'].shift(1)\n    weekly['wow_change'] = (weekly['units_sold'] - weekly['prev_week']) / weekly['prev_week']\n    flagged = weekly[weekly['wow_change'] < -threshold].copy()\n    flagged['drop_pct'] = (flagged['wow_change'] * 100).round(1)\n    return flagged[['product_id','week','units_sold','prev_week','drop_pct']]\n\nresult = flag_sales_drops(sales_df)\nprint(f'{len(result)} product-weeks flagged')" },
      { level: "Intermediate", q: "What is a demand forecast and what are the differences between moving average, exponential smoothing, and seasonal decomposition methods?", a: "A demand forecast predicts future sales volume to drive inventory replenishment decisions. Moving average: simple average of last N periods — smooths noise but lags trends and ignores seasonality. Good for stable items. Exponential smoothing: weighted average giving more weight to recent data (alpha controls how fast weights decay) — better responsiveness than MA. Holt-Winters adds trend and seasonality components. Seasonal decomposition (STL): decomposes time series into trend + seasonal + residual components — best for items with strong weekly/monthly patterns like grocery. For a pickup grocery operation: most produce needs daily forecasting with weekly seasonality; staples can use weekly with monthly seasonality." },
      { level: "Intermediate", q: "How would you use Excel to build a dynamic dashboard for store-level fulfillment metrics that updates when new data is added?", a: "Structure: (1) Raw data in a named Excel Table (Ctrl+T) — tables auto-expand when new rows added. (2) Power Query to clean and aggregate the data — set to refresh automatically on open. (3) PivotTables sourced from the Query output — structured references update automatically. (4) Dashboard sheet with chart objects linked to PivotTable data. (5) Slicers connected to PivotTables for interactive filtering. Key: never build formulas that reference fixed cell ranges like A2:A1000 — always reference the Table name (Table1[Fulfillment_Rate]) so formulas survive new data additions. Add a 'Last Refreshed' cell with =NOW() formatted as timestamp." },
      // Advanced
      { level: "Advanced", q: "Design an end-to-end supply chain analytics pipeline for a grocery pickup operation that predicts stockout risk 48 hours in advance.", a: "Inputs: point-of-sale sales velocity (last 7 days per SKU), current inventory positions, scheduled deliveries (next 48h), historical demand patterns by day-of-week and season. Pipeline: (1) Ingest — Python pulls from inventory API + POS export daily. (2) Feature engineering — days of supply = on_hand / avg_daily_demand, demand_trend = slope of last 7 days, seasonal_index = ratio of this day's historical avg to overall avg. (3) Model — Gradient Boosting classifier, target = stockout_in_48h (binary). Features: days_of_supply, demand_trend, seasonal_index, scheduled_delivery_qty, day_of_week. (4) Output — risk score per SKU per store, pushed to dashboard with auto-generated replenishment recommendations. (5) Alert — Slack message to store manager for High risk items. Retrain model monthly as patterns shift." },
      { level: "Advanced", q: "Explain slowly changing dimensions using a retail example, and implement a Type 2 SCD update in SQL.", a: "SCD Type 2 preserves history when a dimension attribute changes. Retail example: a customer moves from Chicago to Dallas. You need historical orders to show Chicago, future orders to show Dallas. Implementation:\n\n-- Insert new record, close old one\nUPDATE dim_customer\nSET end_date = CURRENT_DATE - 1, is_current = FALSE\nWHERE customer_id = 12345 AND is_current = TRUE;\n\nINSERT INTO dim_customer\n  (customer_id, city, state, start_date, end_date, is_current)\nVALUES\n  (12345, 'Dallas', 'TX', CURRENT_DATE, '9999-12-31', TRUE);\n\nWhen joining orders to customers: JOIN dim_customer ON order.customer_id = dim_customer.customer_id AND order.order_date BETWEEN dim_customer.start_date AND dim_customer.end_date. This gives historically accurate city for every order." },
      { level: "Advanced", q: "A regional VP wants to know which stores are underperforming relative to their market potential. How do you build a store performance index?", a: "Market potential approach: (1) Define potential — use external data (population density, median income, competitor proximity) to estimate a market index per store location. (2) Calculate actual performance — revenue per square foot, transactions per day, basket size. (3) Build index — standardize both actual and potential to z-scores, calculate performance_index = actual_zscore / potential_zscore. Stores > 1.0 are outperforming their market; < 0.5 are significantly underperforming. (4) Segment — high potential + low performance = priority investment targets. Low potential + low performance = consider closure. High performance everywhere = identify what those stores do differently and replicate. Present as scatter plot: x-axis = market potential, y-axis = actual performance, quadrant lines at median." },
      { level: "Advanced", q: "Walk through how you would implement a recommendation system for a grocery pickup platform to suggest substitutions when items are out of stock.", a: "Approach: content-based + collaborative filtering hybrid. (1) Content features per product: category, brand, nutritional profile, price tier, packaging size. (2) Customer purchase history — which substitutions did customers accept vs. reject previously? Accepted = positive signal. (3) Collaborative filtering — customers who bought item A also bought item B (market basket analysis using Apriori or FP-Growth algorithm in Python mlxtend). (4) Ranking — score each candidate substitution by: similarity score × customer acceptance history × price delta penalty × availability. (5) Business rules override — never substitute organic with non-organic unless customer explicitly allows it. (6) Deploy — API endpoint: given item_id + customer_id, return ranked list of 3 substitution candidates with confidence scores." },
      { level: "Advanced", q: "How would you build a Python ETL pipeline to consolidate sales data from 200 stores into a central analytics database, handling schema differences, missing data, and incremental loads?", a: "import pandas as pd\nfrom sqlalchemy import create_engine\nimport os\nfrom datetime import datetime, timedelta\n\ndef extract(store_id, last_run_date):\n    # Pull only new data since last run (incremental)\n    df = pd.read_csv(f'stores/{store_id}/sales.csv', parse_dates=['date'])\n    return df[df['date'] > last_run_date]\n\ndef transform(df, store_id):\n    # Standardize schema differences across stores\n    col_map = {'Sale_Amt': 'revenue', 'Units': 'units_sold', 'Prod_ID': 'product_id'}\n    df = df.rename(columns={k:v for k,v in col_map.items() if k in df.columns})\n    df['store_id'] = store_id\n    df = df.dropna(subset=['product_id','revenue'])  # drop critical nulls\n    df['revenue'] = pd.to_numeric(df['revenue'], errors='coerce').fillna(0)\n    return df[['date','store_id','product_id','units_sold','revenue']]\n\ndef load(df, engine):\n    df.to_sql('sales_fact', engine, if_exists='append', index=False,\n              method='multi', chunksize=1000)  # batch inserts for performance\n\nengine = create_engine('postgresql://...')\nlast_run = datetime.today() - timedelta(days=1)\nfor store_id in range(1, 201):\n    try:\n        df = extract(store_id, last_run)\n        df = transform(df, store_id)\n        load(df, engine)\n    except Exception as e:\n        print(f'Store {store_id} failed: {e}')  # log, don't crash pipeline" },
      { level: "Basic", q: "What is a same-store sales (comp sales) metric and how do you calculate it? Why do retailers use it instead of total revenue growth?", a: "Same-store sales measures revenue growth for stores open for at least 12 months, excluding new store openings. Formula: (current_period_revenue_for_comp_stores - prior_period_revenue_for_comp_stores) / prior_period_revenue × 100. SQL: SELECT SUM(CASE WHEN is_comp_store = 1 THEN current_revenue END) / SUM(CASE WHEN is_comp_store = 1 THEN prior_revenue END) - 1 AS comp_sales_growth FROM stores. Retailers use it because total revenue growth can be inflated by new store openings — comp sales shows whether the existing business is actually growing. It's the most closely watched metric in retail earnings." },
      { level: "Basic", q: "What is shrinkage in retail analytics and how would you quantify it?", a: "Shrinkage = the difference between recorded inventory and actual physical inventory. Sources: theft (external and internal), vendor fraud, administrative errors, and damage. Formula: shrinkage_rate = (book_inventory - physical_count) / book_inventory × 100. SQL: SELECT category, SUM(book_qty * unit_cost) AS book_value, SUM(physical_qty * unit_cost) AS physical_value, (SUM(book_qty) - SUM(physical_qty)) * AVG(unit_cost) AS shrink_dollars, (SUM(book_qty) - SUM(physical_qty)) / SUM(book_qty) * 100 AS shrink_rate FROM inventory_audit GROUP BY category ORDER BY shrink_dollars DESC. Benchmark: grocery retail typically targets < 1% shrinkage." },
      { level: "Intermediate", q: "How would you use Python to detect anomalies in daily store sales that might indicate data quality issues or operational problems?", a: "import pandas as pd\nimport numpy as np\n\ndef detect_sales_anomalies(df):\n    df = df.sort_values(['store_id', 'date'])\n    # Calculate rolling stats per store\n    df['rolling_mean'] = df.groupby('store_id')['daily_sales'].transform(\n        lambda x: x.rolling(14, min_periods=7).mean()\n    )\n    df['rolling_std'] = df.groupby('store_id')['daily_sales'].transform(\n        lambda x: x.rolling(14, min_periods=7).std()\n    )\n    # Flag if more than 3 std devs from rolling mean\n    df['z_score'] = (df['daily_sales'] - df['rolling_mean']) / df['rolling_std']\n    df['anomaly_flag'] = df['z_score'].abs() > 3\n    df['anomaly_type'] = np.where(df['z_score'] > 3, 'spike', \n                          np.where(df['z_score'] < -3, 'drop', 'normal'))\n    return df[df['anomaly_flag']][['store_id','date','daily_sales','z_score','anomaly_type']]\n\n# Zero sales on a non-holiday = likely POS system down, not a true zero\nalerts = detect_sales_anomalies(sales_df)\nprint(f'{len(alerts)} anomalies detected — review with store ops team')" },
      { level: "Intermediate", q: "What is basket size analysis and how would you segment customers by basket behavior in SQL?", a: "Basket size = average transaction value per customer visit. Segment customers: SELECT customer_id, AVG(transaction_total) AS avg_basket, COUNT(transaction_id) AS visit_frequency, SUM(transaction_total) AS total_spend, NTILE(4) OVER (ORDER BY AVG(transaction_total)) AS basket_quartile, NTILE(4) OVER (ORDER BY COUNT(transaction_id)) AS frequency_quartile FROM transactions GROUP BY customer_id. Then classify: high basket + high frequency = Champions. High basket + low frequency = Big Spenders (infrequent). Low basket + high frequency = Deal Seekers. Low basket + low frequency = At Risk. Each segment gets a different retention and upsell strategy. Walmart grocery pickup customers skew toward large weekly baskets — basket size is a key health metric." },
      { level: "Advanced", q: "How would you measure the cannibalization effect when Walmart launches a new store near an existing one? Walk through the analytics approach.", a: "Define the problem: does the new store take sales from the existing store, and by how much? Approach: (1) Control group — identify comparable stores in markets without new store openings, matched on store size, demographics, comp sales trend. (2) Difference-in-differences analysis: measure existing store sales trend before new store opens, compare to control group trend. Post-opening divergence = cannibalization estimate. (3) SQL: create pre/post flags, calculate: avg_sales(existing store, post) - avg_sales(existing store, pre) - [avg_sales(control, post) - avg_sales(control, pre)]. The bracketed term removes macro trends. (4) Geographic analysis: what % of new store's customers have existing store loyalty cards? If 40% of new store customers previously shopped the old store → high cannibalization. (5) Timeline: cannibalization typically peaks in months 3-9, then subsides as market expands. Present as: total market sales growth vs. individual store comp sales impact." },
      { level: "Basic", q: "What is net promoter score (NPS) and how would you track it in a grocery pickup context?", a: "NPS = % Promoters (9-10 rating) - % Detractors (0-6 rating). Passives (7-8) are excluded. Survey question: 'How likely are you to recommend Walmart Pickup to a friend?' Scale 0-10. In grocery pickup, NPS is tracked after each order completion. SQL: SELECT (SUM(CASE WHEN score >= 9 THEN 1 END) - SUM(CASE WHEN score <= 6 THEN 1 END)) * 100.0 / COUNT(*) AS nps FROM pickup_surveys WHERE survey_date >= CURRENT_DATE - 30. Track NPS by store, associate, pickup time slot, and weather conditions. Low NPS on Friday evenings often indicates staffing/wait time issues. Benchmark: NPS > 50 is excellent for grocery." },
      { level: "Intermediate", q: "How would you build an A/B test to measure whether a new grocery pickup UI reduces order abandonment? What metrics do you track and how do you analyze results?", a: "Setup: randomly assign customers to control (old UI) vs. treatment (new UI) — randomize at customer_id level, not session level, to avoid same customer seeing both versions. Primary metric: order completion rate = completed_orders / started_orders. Secondary: time-to-complete, items per order, customer satisfaction score. Run for: minimum 2 weeks (capture weekly patterns), targeting 80% statistical power with 5% significance level — use a sample size calculator to determine required n per arm. Analysis SQL: SELECT test_group, COUNT(DISTINCT session_id) AS sessions, SUM(completed) AS completions, AVG(completed) AS completion_rate FROM ab_test_assignments t JOIN sessions s ON t.customer_id = s.customer_id GROUP BY test_group. Statistical test: two-proportion z-test or chi-square. Watch for: novelty effect (new UI looks better initially), seasonal confounding, and segment differences (mobile vs. desktop may respond differently)." },
    ]
  },

  healthcare: {
    id: "healthcare",
    label: "Healthcare / MSPB",
    icon: "🏥",
    color: "#f472b6",
    description: "CMS analytics, MSPB spending, readmission rates, quality measures, value-based care",
    questions: [
      // Basic
      { level: "Basic", q: "What is the Medicare Spending Per Beneficiary (MSPB) measure and what does it capture?", a: "MSPB measures Medicare spending for services during an episode of care: 3 days before inpatient admission through 30 days after discharge. It captures the full cost of care, not just the hospital stay. CMS uses it to compare hospitals' efficiency relative to the national median. An MSPB ratio > 1.0 means a hospital spends more than the national median after adjusting for patient complexity. It's used in the Hospital Value-Based Purchasing program to reward efficient high-quality care." },
      { level: "Basic", q: "What is a 30-day readmission rate and how would you calculate it from claims data?", a: "30-day readmission rate = patients readmitted to any hospital within 30 days of discharge / total discharges for that condition. CMS calculates risk-standardized readmission rates (RSRR) that adjust for patient complexity. Basic SQL: SELECT COUNT(CASE WHEN EXISTS (SELECT 1 FROM admissions r WHERE r.patient_id = a.patient_id AND r.admit_date BETWEEN a.discharge_date AND a.discharge_date + 30 AND r.admission_id != a.admission_id) THEN 1 END) * 100.0 / COUNT(*) AS readmission_rate FROM admissions a WHERE a.discharge_date IS NOT NULL." },
      { level: "Basic", q: "What is risk adjustment in healthcare analytics and why is it necessary when comparing hospitals?", a: "Risk adjustment accounts for differences in patient complexity across hospitals — you can't fairly compare a trauma center serving critically ill patients to a community hospital serving healthier patients. CMS uses hierarchical condition categories (HCCs) based on diagnoses to create a risk score per patient. An adjusted measure controls for patient mix, so differences in outcomes or spending reflect care quality and efficiency, not just who gets sicker patients. Without risk adjustment, hospitals serving complex patients would always look worse." },
      { level: "Basic", q: "What is a DRG (Diagnosis Related Group) and why do analysts use it to segment hospital data?", a: "A DRG is a classification system that groups patients with similar diagnoses, treatments, and expected resource consumption into categories used for Medicare payment. Hospitals receive a fixed payment per DRG regardless of actual cost — incentive to be efficient. Analysts use DRGs to: compare costs for similar conditions across hospitals (apples-to-apples), identify high-cost DRGs driving MSPB, analyze length of stay variation within the same DRG, and identify outlier cases. DRG 470 (Major Hip and Knee Replacement) is one of the most common and closely watched." },
      { level: "Basic", q: "Write a SQL query to calculate average length of stay by diagnosis category from an admissions table.", a: "SELECT diagnosis_category,\n  COUNT(*) AS total_admissions,\n  AVG(DATEDIFF(discharge_date, admit_date)) AS avg_los_days,\n  PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY DATEDIFF(discharge_date, admit_date)) AS median_los\nFROM admissions\nWHERE discharge_date IS NOT NULL\nGROUP BY diagnosis_category\nORDER BY avg_los_days DESC;\n\nMedian is often more useful than mean for LOS because outliers (very long stays) can skew the average significantly." },
      { level: "Basic", q: "What is the difference between a process measure and an outcome measure in healthcare quality analytics?", a: "Process measures track whether providers did the right thing — e.g., did the patient receive aspirin within 24 hours of heart attack? Outcome measures track what happened to the patient — mortality rate, readmission rate, complication rate. Process measures are easier to control but don't guarantee good outcomes. Outcome measures are what ultimately matters but are influenced by factors outside provider control (patient behavior, social determinants). MSPB is an outcome measure (spending outcome). Appropriate VTE prophylaxis given is a process measure. Good analytics uses both to get the full picture." },
      { level: "Basic", q: "What is a claim in healthcare data and what key fields does a medical claim contain?", a: "A claim is a bill submitted to an insurer (Medicare, Medicaid, commercial) for services rendered. Key fields: claim_id, patient_id (beneficiary), provider_NPI, admission_date, discharge_date, principal_diagnosis (ICD-10 code), secondary diagnoses (up to 25 in Medicare), procedure codes (CPT), DRG_code, total_charges, allowed_amount, paid_amount, claim_type (inpatient/outpatient/physician). The paid_amount is what the insurer actually reimbursed after applying coverage rules. Analysts join claim types to build episode-level spending — the foundation of MSPB analysis." },
      { level: "Basic", q: "What is an ICD-10 code and how is it used in healthcare analytics?", a: "ICD-10 (International Classification of Diseases, 10th revision) is the standard system for coding diagnoses and procedures. Format: letter + 2 numbers + optional decimal + up to 4 characters (e.g., J18.9 = Pneumonia, unspecified). In analytics, ICD-10 codes are used to: identify patient conditions (filter to pneumonia patients), group into DRGs, calculate comorbidity scores (Elixhauser, Charlson), identify complications, and define cohorts for readmission analysis. Clinical knowledge matters — ICD codes have hierarchies; J18.x = all pneumonia codes, not just J18.9." },
      { level: "Basic", q: "A hospital administrator asks you to compare their MSPB to similar hospitals. How do you define 'similar' for a fair comparison?", a: "Define peer group using: (1) Hospital size — similar number of beds or annual discharges. (2) Teaching status — academic medical centers vs. community hospitals (different case mix). (3) Urban vs. rural — affects patient complexity and access to post-acute care. (4) Geographic region — wage index affects labor costs. (5) Safety-net status — hospitals serving high proportions of dual-eligible (Medicare+Medicaid) patients have different patient complexity. CMS already risk-adjusts MSPB for patient complexity, but peer benchmarking within similar hospital types gives more actionable comparisons than raw national comparisons." },
      { level: "Basic", q: "What is the Charlson Comorbidity Index and how is it used in healthcare data analysis?", a: "The Charlson Comorbidity Index (CCI) assigns weights to 17 conditions (diabetes, heart failure, cancer, etc.) based on their impact on 1-year mortality risk. A patient's CCI score is the sum of weights for all conditions present. Higher score = more complex/sicker patient. In analytics it's used for: risk adjustment (control for comorbidity differences between hospitals), patient stratification (separate analyses by complexity tier), cost prediction (CCI correlates strongly with MSPB), and identifying high-risk patients for care management programs. Calculated by mapping ICD-10 codes to CCI categories." },
      // Intermediate
      { level: "Intermediate", q: "Write a Python script to calculate the risk-standardized readmission rate for a hospital using logistic regression, adjusting for patient age, gender, and Charlson comorbidity score.", a: "import pandas as pd\nfrom sklearn.linear_model import LogisticRegression\nfrom sklearn.preprocessing import StandardScaler\n\n# df: patient-level data with readmission outcome\nfeatures = ['age', 'gender_male', 'charlson_score', 'los_index_admit']\nX = df[features]\ny = df['readmitted_30d']\n\n# Fit model on full dataset (or national reference)\nscaler = StandardScaler()\nX_scaled = scaler.fit_transform(X)\nmodel = LogisticRegression()\nmodel.fit(X_scaled, y)\n\n# Risk-standardized rate = observed / expected * national rate\ndf['predicted_prob'] = model.predict_proba(X_scaled)[:, 1]\nhospital = df[df['hospital_id'] == target_hospital_id]\nobserved = hospital['readmitted_30d'].mean()\nexpected = hospital['predicted_prob'].mean()\nnational_rate = df['readmitted_30d'].mean()\nrsrr = (observed / expected) * national_rate\nprint(f'RSRR: {rsrr:.4f}')" },
      { level: "Intermediate", q: "How would you build a Tableau dashboard to help a hospital quality team monitor their MSPB performance across service lines?", a: "Views: (1) MSPB ratio trend — line chart by month, reference line at 1.0 (national median), color-coded above/below. (2) MSPB breakdown by episode phase — stacked bar showing index admission, post-acute, physician/other spending components. (3) Service line comparison — sorted bar chart of MSPB ratio by DRG or service line (cardiology, orthopedics, etc.). (4) Outlier cases — scatter plot of individual episode cost vs. risk score, flag statistical outliers. (5) Readmission driver analysis — which conditions are most associated with readmissions and high post-acute costs? Use parameter to switch between MSPB ratio, raw spending, and percentile rank vs. peers. Color-code all views: green < 0.9, yellow 0.9-1.1, red > 1.1." },
      { level: "Intermediate", q: "What is a funnel plot in healthcare analytics and when would you use it?", a: "A funnel plot displays hospital-level performance metrics (e.g., readmission rates, MSPB) on the y-axis against hospital volume (discharges) on the x-axis. Control limits form a funnel shape — wider at low volume (high statistical uncertainty), narrowing at high volume. Hospitals outside the funnel are statistical outliers — genuinely different performance, not just random variation. Use it when: comparing many hospitals on an outcome metric, you want to identify which outliers are statistically significant (not just noisy low-volume hospitals), and you want to communicate uncertainty visually. Much better than a simple ranked bar chart because it accounts for sample size." },
      { level: "Intermediate", q: "Describe how you would use SQL window functions to identify patients who had multiple admissions within a 90-day period (potential high utilizers for care management).", a: "SELECT patient_id, admit_date, discharge_date,\n  COUNT(*) OVER (\n    PARTITION BY patient_id\n    ORDER BY admit_date\n    RANGE BETWEEN INTERVAL 90 DAY PRECEDING AND CURRENT ROW\n  ) AS admissions_in_90day_window\nFROM admissions\nHAVING admissions_in_90day_window >= 3\nORDER BY patient_id, admit_date;\n\nThis uses a sliding window range frame. RANGE BETWEEN INTERVAL 90 DAY PRECEDING AND CURRENT ROW counts all admissions for that patient in the 90 days before and including the current row's date — identifies frequent fliers regardless of which specific 90-day window you look at." },
      { level: "Intermediate", q: "What is the difference between Medicare FFS (fee-for-service) data and Medicare Advantage data in healthcare analytics, and how does this affect MSPB analysis?", a: "Medicare FFS: government pays providers directly per service — complete, detailed claims data available for analysis. Medicare Advantage: private insurers receive capitated payments from CMS, then pay providers — encounter data is less complete and standardized than FFS claims. MSPB is calculated only on FFS beneficiaries because complete episode-level claims are available. This creates a selection bias problem: if sicker patients disproportionately stay in FFS while healthier patients enroll in MA, MSPB comparisons across time or geographies can be distorted by this enrollment shift. Analysts must always note what proportion of patients are FFS vs. MA in their market." },
      { level: "Intermediate", q: "Write a Python script to calculate Elixhauser comorbidity scores from a DataFrame of ICD-10 diagnosis codes.", a: "ELIXHAUSER_MAP = {\n  'CHF': ['I099','I110','I130','I132','I255','I420','I425','I426','I427','I428','I429','I43','I50'],\n  'Diabetes': ['E100','E101','E109','E110','E111','E119','E120','E121','E129'],\n  # ... (full map has 30+ conditions)\n}\n\ndef calc_elixhauser(icd_list):\n    score = 0\n    conditions_present = []\n    for condition, codes in ELIXHAUSER_MAP.items():\n        if any(code[:3] in [c[:3] for c in codes] for code in icd_list):\n            score += 1\n            conditions_present.append(condition)\n    return score, conditions_present\n\n# Apply to patient-level DataFrame\ndf['icd_list'] = df['diagnosis_codes'].str.split(',')\ndf[['elixhauser_score','conditions']] = pd.DataFrame(\n    df['icd_list'].apply(calc_elixhauser).tolist(), index=df.index\n)" },
      { level: "Intermediate", q: "How would you design a cohort study in SQL to compare 30-day readmission rates between patients who received discharge planning versus those who did not?", a: "WITH discharge_planning AS (\n  -- Flag patients who received discharge planning service\n  SELECT DISTINCT patient_id, 1 AS had_planning\n  FROM procedures\n  WHERE procedure_code IN ('99495','99496')  -- Transitional Care Management codes\n),\ncohort AS (\n  SELECT a.patient_id, a.discharge_date,\n    COALESCE(dp.had_planning, 0) AS had_planning\n  FROM admissions a\n  LEFT JOIN discharge_planning dp ON a.patient_id = dp.patient_id\n),\nreadmits AS (\n  SELECT DISTINCT a.patient_id\n  FROM admissions a\n  JOIN cohort c ON a.patient_id = c.patient_id\n  WHERE a.admit_date BETWEEN c.discharge_date AND c.discharge_date + 30\n)\nSELECT had_planning,\n  COUNT(*) AS n,\n  SUM(CASE WHEN r.patient_id IS NOT NULL THEN 1 ELSE 0 END) AS readmissions,\n  ROUND(AVG(CASE WHEN r.patient_id IS NOT NULL THEN 1.0 ELSE 0 END) * 100, 2) AS readmit_rate\nFROM cohort c LEFT JOIN readmits r ON c.patient_id = r.patient_id\nGROUP BY had_planning;" },
      { level: "Intermediate", q: "What is post-acute care spending and why does it matter so much in MSPB analysis?", a: "Post-acute care (PAC) includes skilled nursing facility (SNF) stays, home health visits, inpatient rehabilitation, and long-term acute care after a hospital discharge. PAC often represents 30-50% of total MSPB spending — sometimes more than the hospital stay itself. It matters because: (1) Hospitals have limited control over it (patients choose their SNF) but it's in their MSPB calculation. (2) There's enormous variation in PAC utilization rates and costs across hospitals and regions. (3) High-performing hospitals on MSPB typically have active discharge planning programs that steer patients to high-quality, cost-effective PAC providers. (4) The 30-day window post-discharge is where readmissions add the most cost." },
      // Advanced
      { level: "Advanced", q: "Design a full analytics framework to identify the 5 biggest drivers of MSPB above the national median for a hospital system with 8 facilities.", a: "Framework: (1) Decomposition — break MSPB into components: index admission, readmissions, SNF stays, home health, physician services. Which component is highest vs. peers? (2) DRG-level analysis — for each component, which DRGs contribute most to above-median spending? Focus on high-volume, high-variance DRGs. (3) Process analysis — for top DRGs: compare LOS, discharge destination mix (home vs. SNF vs. rehab), readmission rates. Where is the variation coming from? (4) Provider-level analysis — within DRGs, is variation driven by specific physicians, hospitalists, or discharge planners? (5) Root cause — for each driver, is it patient acuity (case mix issue), process (discharge planning), or network (using expensive PAC providers)? Output: heat map of 8 facilities × 5 spending drivers, plus waterfall chart showing path from facility MSPB to national median." },
      { level: "Advanced", q: "Walk through how you would build a propensity score matching analysis in Python to evaluate the impact of a care transitions program on 30-day readmissions.", a: "from sklearn.linear_model import LogisticRegression\nfrom sklearn.preprocessing import StandardScaler\nimport pandas as pd\nimport numpy as np\n\n# Covariates to balance on\ncovariates = ['age','gender','charlson_score','prior_admits_12mo','drg_weight','discharge_disposition']\n\n# Step 1: Estimate propensity scores\nX = df[covariates]\ny = df['received_intervention']  # 1 = care transitions program\nscaler = StandardScaler()\nmodel = LogisticRegression(max_iter=1000)\nmodel.fit(scaler.fit_transform(X), y)\ndf['propensity_score'] = model.predict_proba(scaler.transform(X))[:,1]\n\n# Step 2: Match treated to control (nearest neighbor, caliper = 0.02)\ntreated = df[df['received_intervention']==1].copy()\ncontrol = df[df['received_intervention']==0].copy()\n\nmatches = []\nfor _, t_row in treated.iterrows():\n    diffs = abs(control['propensity_score'] - t_row['propensity_score'])\n    best = diffs.idxmin()\n    if diffs[best] < 0.02:  # caliper\n        matches.append((t_row.name, best))\n        control = control.drop(best)  # remove matched control\n\n# Step 3: Compare outcomes in matched sample\nmatched_ids = [i for pair in matches for i in pair]\nmatched_df = df.loc[matched_ids]\noutcome = matched_df.groupby('received_intervention')['readmitted_30d'].mean()\nprint(f'Treated: {outcome[1]:.3f}, Control: {outcome[0]:.3f}, Difference: {outcome[1]-outcome[0]:.3f}')" },
      { level: "Advanced", q: "What are the major methodological limitations of using Medicare claims data for outcomes research, and how do you address them?", a: "Limitations and mitigations: (1) Selection bias — sicker patients may systematically go to certain hospitals. Mitigate: risk adjustment using patient characteristics; consider instrumental variables. (2) Coding variation — some hospitals code more diagnoses (capturing more comorbidities) which can make them appear sicker and affect risk adjustment. Mitigate: use only present-on-admission flags for comorbidities. (3) FFS only — MA patients excluded (35%+ of Medicare now). Mitigate: note this limitation, use supplemental MA encounter data if available. (4) Lag — claims data typically 3-6 months delayed. Mitigate: use for retrospective analysis, not real-time monitoring. (5) Incomplete care picture — claims show what was billed, not clinical detail. Mitigate: supplement with EHR data for process measures. (6) Spillover effects — a hospital intervention may affect non-Medicare patients too, but you only see Medicare outcomes." },
      { level: "Advanced", q: "How would you build a predictive model to identify patients at high risk of 30-day readmission at discharge, using claims and EHR data?", a: "Feature engineering from claims: prior_admits_12mo, charlson_score, MSPB_index_admission, discharge_disposition, los, drg_weight, payer_mix, post_acute_referral_made. From EHR: vital sign instability at discharge, polypharmacy_count, social_determinants (housing_unstable, low_health_literacy, lives_alone), discharge_teaching_completed. Model: XGBoost classifier — handles missing data, non-linear interactions, outputs calibrated probabilities. Target: readmission within 30 days. Evaluation: AUROC > 0.75 is good, also check calibration curve (predicted probabilities match observed rates). At discharge: score each patient, flag top 20% as high-risk, trigger care transitions referral. Monitor: track model performance monthly, check for calibration drift as patient mix shifts. Retrain quarterly." },
      { level: "Advanced", q: "Explain how value-based purchasing programs like HVBP create financial incentives related to MSPB, and how a data analyst supports the hospital's strategy.", a: "Hospital Value-Based Purchasing (HVBP) adjusts Medicare payments by up to ±2% based on performance across four domains: Clinical Outcomes (25%), Person & Community Engagement (25%), Safety (25%), and Efficiency & Cost Reduction (25%). MSPB falls in the Efficiency domain. How it works: CMS scores each hospital 0-10 on MSPB relative to national performance. Higher score = higher payment adjustment bonus. A hospital with MSPB ratio above 1.1 could lose 1-2% of all Medicare DRG payments — millions of dollars. Analyst's role: (1) Monthly MSPB tracking against prior year and national benchmarks. (2) Simulation modeling — if we reduce SNF utilization by X%, what's the projected MSPB impact? (3) Service line reports — which DRGs are dragging MSPB up? (4) Physician scorecards — show each admitting physician their episode costs vs. peers. (5) ROI analysis — is investing in discharge planning staff worth the MSPB improvement?" },
      { level: "Basic", q: "What is a Diagnosis Related Group (DRG) and why is it the fundamental unit of analysis in hospital financial analytics?", a: "A DRG is a classification system that groups hospital inpatient stays by diagnosis, procedure, complications, and patient age into clinically coherent, financially similar groups. Medicare pays a fixed amount per DRG regardless of actual costs — this is prospective payment. Each DRG has a relative weight (e.g. a complex cardiac DRG might have weight 3.5, meaning it pays 3.5x the base rate). DRG is the fundamental unit because: (1) It's how Medicare pays — every financial analysis starts with DRG. (2) Comparing hospitals fairly requires DRG adjustment for case mix. (3) Volume + DRG weight = case mix index, the primary driver of revenue." },
      { level: "Basic", q: "What is length of stay (LOS) and why does it matter in MSPB analysis?", a: "Length of stay = number of days from admission to discharge. LOS matters in MSPB because: (1) Longer LOS = higher direct hospital costs for that admission. (2) Hospitals with above-average LOS for a DRG often have higher MSPB ratios. (3) However, appropriate LOS vs. excessive LOS requires clinical context — discharging patients too quickly increases readmission risk, which also increases MSPB. The sweet spot: LOS at or near the geometric mean for each DRG while minimizing 30-day readmissions. SQL: SELECT drg_code, AVG(los) AS avg_los, national_gmlos, AVG(los) - national_gmlos AS los_variance FROM admissions GROUP BY drg_code ORDER BY los_variance DESC." },
      { level: "Intermediate", q: "What is case mix index (CMI) and how do you calculate and interpret it?", a: "Case Mix Index = average DRG relative weight for all admissions. Formula: CMI = SUM(drg_weight for all discharges) / total_discharge_count. A higher CMI means the hospital treats more complex, resource-intensive patients. Interpreting CMI changes: if CMI increases and revenue increases proportionally, the hospital is correctly capturing complexity. If CMI is flat but MSPB is rising, inefficiency (not complexity) is driving costs. SQL: SELECT period, SUM(d.relative_weight) / COUNT(a.admission_id) AS cmi FROM admissions a JOIN drg_weights d ON a.drg_code = d.drg_code GROUP BY period. CMI of 1.5 means your average patient is 50% more complex than the national base case." },
      { level: "Intermediate", q: "How would you build a Tableau dashboard to help a hospital's CFO monitor MSPB performance monthly? Describe the key views.", a: "Dashboard layout: (1) Header scorecard — current MSPB ratio vs. last year vs. national median. Red/yellow/green status. (2) Trend line — 24-month MSPB ratio with benchmark overlay. Forecast line using linear trend. (3) Component waterfall — MSPB breakdown: index admission + readmissions + SNF + home health + physician services. Which component drives variance vs. peers? (4) DRG heat map — top 20 DRGs by volume, color-coded by MSPB ratio vs. national. Click to drill in. (5) Discharge destination donut — % going home vs. SNF vs. rehab vs. other. High SNF % = major MSPB driver. (6) Physician scorecard — avg episode cost by attending physician for top DRGs. Anonymized for public view, identified for internal. Filters: date range, DRG, service line, facility." },
      { level: "Intermediate", q: "What is risk adjustment in healthcare analytics and why is it essential when comparing hospital outcomes?", a: "Risk adjustment statistically controls for differences in patient complexity so that hospital outcomes reflect care quality, not just how sick the patients were. Without it: a safety-net hospital serving elderly, diabetic, low-income patients will always look worse than a community hospital serving healthy, young patients even if care quality is identical. Methods: (1) CMS Hierarchical Condition Categories (HCC) — assigns weights to diagnoses to predict cost. (2) Elixhauser comorbidity index — counts 30+ comorbidities and weights their effect on outcomes. (3) Direct standardization — apply hospital's actual case mix to a reference population's rates. When doing MSPB analysis: always compare your hospital's risk-adjusted ratio to the national median, never raw spending. A hospital treating sicker patients should have higher raw spending but a similar or lower risk-adjusted ratio." },
      { level: "Advanced", q: "You are asked to identify the top 5 opportunities to reduce MSPB at a 500-bed academic medical center. Walk through your analysis framework.", a: "Framework: (1) Decompose MSPB by component: what % is index admission, readmissions, SNF, home health, physician? Identify which component is highest vs. national benchmark. (2) Volume-weighted impact: rank DRGs by (volume × MSPB ratio vs. national). High volume + high ratio = biggest opportunity. Focus on top 10 DRGs which typically represent 60%+ of total MSPB. (3) Process drill-down per top DRG: compare LOS, discharge destination mix (home vs. SNF vs. rehab), readmission rate, physician practice variation. (4) Root cause: for each DRG — is the driver LOS? Post-acute overutilization? Specific physician outliers? Readmissions? (5) Quantify opportunity: if DRG X MSPB ratio went from 1.15 to 1.05 (national), what is the annual episode cost reduction? Multiply by volume. Sum top 5 opportunities = total addressable savings. Prioritize by: impact × feasibility × timeline to results. Present as heat map + waterfall chart." },
    ]
  }
};

const DOMAIN_MODULE_IDS = Object.keys(DOMAIN_PACKS);

// ── PERSISTENCE ───────────────────────────────────────────────────────────────

const STORAGE_KEY = "analyst-sharpener-v1";

function loadProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch { return null; }
}

function saveProgress(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {}
}

function defaultProgress() {
  return {
    streak: 0,
    lastSessionDate: null,
    totalSessions: 0,
    allTimeScores: {},       // key: "module:idx" → latest score string
    scoreCounts: {},         // key: "module:idx" → { strong, partial, weak }
    lastSeen: {},            // key: "module:idx" → ISO date string
    weakQueue: [],
    dailyGoalDone: false,
    lastSessionSummary: null,
  };
}

// ── SPACED REPETITION HELPERS ─────────────────────────────────────────────────

function getSpacedRepPriority(progress, key) {
  const counts = progress.scoreCounts?.[key] || { strong: 0, partial: 0, weak: 0 };
  const lastSeenDate = progress.lastSeen?.[key];
  const daysSince = lastSeenDate
    ? Math.floor((Date.now() - new Date(lastSeenDate)) / 86400000)
    : 999;
  // Weak unseen: highest
  if (counts.weak > 0 && counts.strong === 0) return 100 + daysSince;
  // Partial not yet mastered
  if (counts.partial > 0 && counts.strong < 2) return 70 + daysSince;
  // Strong 1-2x: surface after a few days
  if (counts.strong >= 1 && counts.strong < 3) return Math.max(0, 40 - counts.strong * 10 + daysSince * 2);
  // Strong 3+: surface weekly
  if (counts.strong >= 3) return Math.max(0, 10 + daysSince - counts.strong * 5);
  // Unseen
  return 80 + daysSince;
}

function sortCardsBySpacedRep(cards, module, progress) {
  return [...cards]
    .map((card, i) => ({ card, origIdx: i, priority: getSpacedRepPriority(progress, `${module}:${i}`) }))
    .sort((a, b) => b.priority - a.priority);
}

// ── AI CHECKER ────────────────────────────────────────────────────────────────

async function checkAnswer({ type, question, correctAnswer, userAnswer, module, apiKey }) {
  const sys = `You are a strict but fair data analytics interview coach evaluating ${module.toUpperCase()} answers. Respond ONLY with valid JSON — no markdown, no extra text.
Format: {"score":"strong"|"partial"|"weak","summary":"One sentence verdict.","got_right":["..."],"missed":["..."],"coaching":"1-2 sentence coaching tip."}
Be direct. If answer is blank, score weak immediately.`;
  const prompt = type === "code"
    ? `Type: ${module.toUpperCase()} coding\nPrompt: ${question}\nModel solution: ${correctAnswer}\nCandidate: ${userAnswer || "(blank)"}\nEvaluate logic and approach. Minor syntax differences ok if concept is right.`
    : `Type: ${module.toUpperCase()} concept\nQuestion: ${question}\nCorrect: ${correctAnswer}\nCandidate: ${userAnswer || "(blank)"}\nEvaluate whether key concepts are covered.`;
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01", "anthropic-dangerous-direct-browser-access": "true" },
      body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1000, system: sys, messages: [{ role: "user", content: prompt }] }),
    });
    const data = await res.json();
    if (data.error) return { score: "weak", summary: `API error: ${data.error.message}`, got_right: [], missed: [], coaching: "Check your API key." };
    const raw = data.content?.[0]?.text || "{}";
    return JSON.parse(raw.replace(/```json|```/g, "").trim());
  } catch {
    return { score: "weak", summary: "Request failed — check your API key.", got_right: [], missed: [], coaching: "Make sure your key starts with sk-ant-." };
  }
}

// ── SHARED UI ─────────────────────────────────────────────────────────────────

function Badge({ level }) {
  const col = { Basic: C.ok, Intermediate: C.accent, Advanced: C.err }[level] || C.ok;
  return <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", color: col, background: col + "18", border: `1px solid ${col}33`, borderRadius: 4, padding: "2px 7px", fontFamily: mono, textTransform: "uppercase" }}>{level}</span>;
}

function ScorePill({ score }) {
  const [col, label] = { strong: [C.ok, "✓ Strong"], partial: [C.warn, "◑ Partial"], weak: [C.err, "✗ Weak"] }[score] || [C.err, "✗ Weak"];
  return <span style={{ fontSize: 11, fontWeight: 700, color: col, background: col + "18", border: `1px solid ${col}44`, borderRadius: 4, padding: "3px 10px", fontFamily: mono }}>{label}</span>;
}

function Spinner() {
  return <>
    <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    <div style={{ width: 14, height: 14, border: `2px solid ${C.accent}`, borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.7s linear infinite", flexShrink: 0 }} />
  </>;
}

function AIFeedback({ result, loading }) {
  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 0" }}>
      <Spinner />
      <span style={{ color: C.muted, fontFamily: mono, fontSize: 12 }}>Evaluating your answer...</span>
    </div>
  );
  if (!result) return null;
  return (
    <div style={{ background: C.surface, border: `1.5px solid ${C.border}`, borderRadius: 10, overflow: "hidden", marginTop: 14 }}>
      <div style={{ padding: "12px 16px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <ScorePill score={result.score} />
        <span style={{ fontSize: 13, color: C.text }}>{result.summary}</span>
      </div>
      {(result.got_right?.length > 0 || result.missed?.length > 0) && (
        <div style={{ padding: "14px 16px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          {result.got_right?.length > 0 && (
            <div>
              <div style={{ fontSize: 9, fontFamily: mono, color: C.ok, letterSpacing: "0.12em", marginBottom: 7 }}>GOT RIGHT</div>
              {result.got_right.map((item, i) => <div key={i} style={{ fontSize: 12, color: C.text, lineHeight: 1.65, display: "flex", gap: 6, marginBottom: 4 }}><span style={{ color: C.ok, flexShrink: 0 }}>✓</span>{item}</div>)}
            </div>
          )}
          {result.missed?.length > 0 && (
            <div>
              <div style={{ fontSize: 9, fontFamily: mono, color: C.err, letterSpacing: "0.12em", marginBottom: 7 }}>MISSED</div>
              {result.missed.map((item, i) => <div key={i} style={{ fontSize: 12, color: C.text, lineHeight: 1.65, display: "flex", gap: 6, marginBottom: 4 }}><span style={{ color: C.err, flexShrink: 0 }}>✗</span>{item}</div>)}
            </div>
          )}
        </div>
      )}
      {result.coaching && (
        <div style={{ padding: "10px 16px", borderTop: `1px solid ${C.border}`, background: C.accent + "08" }}>
          <span style={{ color: C.accent, fontFamily: mono, fontSize: 9, letterSpacing: "0.12em" }}>COACH: </span>
          <span style={{ fontSize: 12, color: C.text, lineHeight: 1.7 }}>{result.coaching}</span>
        </div>
      )}
    </div>
  );
}

function TArea({ value, onChange, placeholder, rows = 4 }) {
  return (
    <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={rows}
      style={{ width: "100%", background: "#09090f", border: `1.5px solid ${C.border}`, borderRadius: 8, padding: "12px 14px", boxSizing: "border-box", color: C.text, fontFamily: mono, fontSize: 13, lineHeight: 1.7, resize: "vertical", outline: "none" }}
      onFocus={e => e.target.style.borderColor = C.accent}
      onBlur={e => e.target.style.borderColor = C.border}
    />
  );
}

function Btn({ onClick, children, color = C.accent, outline = false, disabled = false, small = false }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      background: outline ? "transparent" : color, color: outline ? color : C.bg,
      border: `1.5px solid ${color}`, borderRadius: 6,
      padding: small ? "5px 12px" : "7px 16px",
      fontFamily: mono, fontSize: small ? 11 : 12, fontWeight: 600,
      cursor: disabled ? "not-allowed" : "pointer",
      opacity: disabled ? 0.45 : 1, letterSpacing: "0.04em",
    }}>{children}</button>
  );
}

// ── STATS PANEL ───────────────────────────────────────────────────────────────

function StatsPanel({ progress, onResetProgress }) {
  const allScores = Object.values(progress.allTimeScores);
  const strong = allScores.filter(s => s === "strong").length;
  const partial = allScores.filter(s => s === "partial").length;
  const weak = allScores.filter(s => s === "weak").length;
  const total = allScores.length;
  const pct = total > 0 ? Math.round((strong / total) * 100) : 0;

  return (
    <div style={{ background: C.card, border: `1.5px solid ${C.border}`, borderRadius: 12, padding: "18px 20px", marginBottom: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <div style={{ fontFamily: mono, fontSize: 10, color: C.muted, letterSpacing: "0.12em" }}>ALL-TIME PROGRESS</div>
        <button onClick={onResetProgress} style={{ background: "transparent", border: "none", color: C.muted, fontFamily: mono, fontSize: 10, cursor: "pointer" }}>reset</button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 10, textAlign: "center" }}>
        {[
          [progress.streak, "STREAK", C.accent, "\ud83d\udd25"],
          [progress.totalSessions, "SESSIONS", C.text, "\ud83d\udcc5"],
          [strong, "STRONG", C.ok, "✓"],
          [partial, "PARTIAL", C.warn, "◑"],
          [weak, "WEAK", C.err, "✗"],
        ].map(([val, label, col, icon]) => (
          <div key={label}>
            <div style={{ fontSize: 22, fontWeight: 700, color: col }}>{val}</div>
            <div style={{ fontSize: 9, color: C.muted, fontFamily: mono, letterSpacing: "0.1em", marginTop: 2 }}>{label}</div>
          </div>
        ))}
      </div>
      {total > 0 && (
        <div style={{ marginTop: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontFamily: mono, fontSize: 10, color: C.muted, marginBottom: 5 }}>
            <span>Strong rate</span><span style={{ color: pct >= 70 ? C.ok : pct >= 40 ? C.warn : C.err }}>{pct}%</span>
          </div>
          <div style={{ height: 4, background: C.border, borderRadius: 2, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${pct}%`, background: pct >= 70 ? C.ok : pct >= 40 ? C.warn : C.err, borderRadius: 2, transition: "width 0.4s" }} />
          </div>
        </div>
      )}
      {progress.weakQueue?.length > 0 && (
        <div style={{ marginTop: 12, padding: "8px 12px", background: C.err + "0d", border: `1px solid ${C.err}33`, borderRadius: 7, fontFamily: mono, fontSize: 11, color: C.err }}>
          ✗ {progress.weakQueue.length} questions flagged for review
        </div>
      )}
    </div>
  );
}

// ── FLASHCARD MODE ────────────────────────────────────────────────────────────

function FlashcardMode({ module, apiKey, progress, onScore }) {
  const rawCards = FLASHCARDS[module] || [];
  const color = MODULES.find(m => m.id === module)?.color || C.accent;
  // Sort by spaced repetition priority on mount — weak/unseen surfaces first, mastered last
  const [sorted] = useState(() => sortCardsBySpacedRep(rawCards, module, progress));
  const [idx, setIdx] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [sessionScores, setSessionScores] = useState({});
  const entry = sorted[idx] || { card: rawCards[0], origIdx: 0 };
  const card = entry.card;
  const origIdx = entry.origIdx;

  const goTo = (i) => { setIdx(i); setUserAnswer(""); setFeedback(null); setRevealed(false); };

  const evaluate = async () => {
    if (!userAnswer.trim() || !apiKey) return;
    setLoading(true); setFeedback(null);
    const result = await checkAnswer({ type: "flashcard", question: card.q, correctAnswer: card.a, userAnswer, module, apiKey });
    setFeedback(result);
    setSessionScores(s => ({ ...s, [idx]: result.score }));
    onScore(module, origIdx, result.score, card);
    setLoading(false);
  };

  const strong = Object.values(sessionScores).filter(v => v === "strong").length;
  const partial = Object.values(sessionScores).filter(v => v === "partial").length;
  const weak = Object.values(sessionScores).filter(v => v === "weak").length;

  // Show persisted score using the original card index
  const persistedScore = progress.allTimeScores[`${module}:${origIdx}`];
  // Show spaced rep hint when card has history
  const counts = progress.scoreCounts?.[`${module}:${origIdx}`];
  const lastSeen = progress.lastSeen?.[`${module}:${origIdx}`];
  const daysSince = lastSeen ? Math.floor((Date.now() - new Date(lastSeen)) / 86400000) : null;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14, alignItems: "center" }}>
        <div style={{ display: "flex", gap: 14, fontFamily: mono, fontSize: 11 }}>
          <span style={{ color: C.ok }}>✓ {strong}</span>
          <span style={{ color: C.warn }}>◑ {partial}</span>
          <span style={{ color: C.err }}>✗ {weak}</span>
        </div>
        <span style={{ fontFamily: mono, fontSize: 11, color: C.muted }}>{idx + 1} / {sorted.length}</span>
      </div>
      <div style={{ height: 3, background: C.border, borderRadius: 2, marginBottom: 20, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${(idx / sorted.length) * 100}%`, background: color, transition: "width 0.3s" }} />
      </div>
      <div style={{ background: C.card, border: `1.5px solid ${C.border}`, borderRadius: 12, padding: "20px 22px", marginBottom: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
          <Badge level={card.level} />
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {persistedScore && <span style={{ fontFamily: mono, fontSize: 9, color: C.muted }}>LAST: <ScorePill score={persistedScore} /></span>}
            {(sessionScores[idx] && !persistedScore) && <ScorePill score={sessionScores[idx]} />}
          </div>
        </div>
        <div style={{ fontSize: 16, lineHeight: 1.65, color: C.text, fontWeight: 500 }}>{card.q}</div>
      </div>
      <div style={{ marginBottom: 10 }}>
        <div style={{ fontFamily: mono, fontSize: 9, color: C.muted, letterSpacing: "0.12em", marginBottom: 6 }}>YOUR ANSWER</div>
        <TArea value={userAnswer} onChange={setUserAnswer} placeholder="Type your answer before checking or revealing..." rows={4} />
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
        <Btn onClick={evaluate} disabled={loading || !userAnswer.trim() || !apiKey} color={color}>
          {loading ? "Checking..." : "⚡ Check My Answer"}
        </Btn>
        <Btn onClick={() => setRevealed(!revealed)} outline color={C.muted}>{revealed ? "Hide answer" : "Reveal answer"}</Btn>
        <Btn onClick={() => goTo((idx - 1 + sorted.length) % sorted.length)} outline color={C.muted}>← Prev</Btn>
        <Btn onClick={() => goTo((idx + 1) % sorted.length)} outline color={C.muted}>Next →</Btn>
      </div>
      <AIFeedback result={feedback} loading={loading} />
      {revealed && (
        <div style={{ marginTop: 14, padding: "14px 18px", background: color + "0a", border: `1.5px solid ${color}33`, borderRadius: 10 }}>
          <div style={{ fontFamily: mono, fontSize: 9, color, letterSpacing: "0.12em", marginBottom: 8 }}>MODEL ANSWER</div>
          <div style={{ fontSize: 14, lineHeight: 1.75, color: C.text }}>{card.a}</div>
        </div>
      )}
    </div>
  );
}

// ── CODING MODE ───────────────────────────────────────────────────────────────

function CodingMode({ module, apiKey, onScore }) {
  const challenges = CODING[module] || [];
  const color = MODULES.find(m => m.id === module)?.color || C.accent;
  const [idx, setIdx] = useState(0);
  const [userCode, setUserCode] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [showHint, setShowHint] = useState(false);

  if (!challenges.length) return (
    <div style={{ padding: 40, textAlign: "center", color: C.muted, fontFamily: mono, fontSize: 13 }}>
      Coding challenges for {module.toUpperCase()} coming soon.
    </div>
  );

  const ch = challenges[idx];
  const goTo = (i) => { setIdx(i); setUserCode(""); setFeedback(null); setShowSolution(false); setShowHint(false); };

  const evaluate = async () => {
    if (!userCode.trim() || !apiKey) return;
    setLoading(true); setFeedback(null);
    const result = await checkAnswer({ type: "code", question: ch.prompt, correctAnswer: ch.solution, userAnswer: userCode, module, apiKey });
    setFeedback(result);
    onScore(`${module}-code`, idx, result.score, { q: ch.prompt });
    setLoading(false);
  };

  return (
    <div>
      <div style={{ display: "flex", gap: 6, marginBottom: 20, flexWrap: "wrap" }}>
        {challenges.map((c, i) => (
          <button key={i} onClick={() => goTo(i)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 14px", background: idx === i ? color + "20" : "transparent", border: `1.5px solid ${idx === i ? color : C.border}`, borderRadius: 6, cursor: "pointer" }}>
            <Badge level={c.level} />
          </button>
        ))}
      </div>
      <div style={{ background: C.card, border: `1.5px solid ${C.border}`, borderRadius: 12, padding: "18px 22px", marginBottom: 14 }}>
        <div style={{ fontFamily: mono, fontSize: 9, color: C.muted, letterSpacing: "0.12em", marginBottom: 10 }}>PROMPT</div>
        <pre style={{ margin: 0, fontSize: 13, lineHeight: 1.75, color: C.text, fontFamily: sans, whiteSpace: "pre-wrap" }}>{ch.prompt}</pre>
      </div>
      <div style={{ marginBottom: 10 }}>
        <div style={{ fontFamily: mono, fontSize: 9, color: C.muted, letterSpacing: "0.12em", marginBottom: 6 }}>YOUR CODE</div>
        <TArea value={userCode} onChange={setUserCode} placeholder="Write your solution here..." rows={7} />
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
        <Btn onClick={evaluate} disabled={loading || !userCode.trim() || !apiKey} color={color}>{loading ? "Checking..." : "⚡ Check My Code"}</Btn>
        <Btn onClick={() => setShowHint(!showHint)} outline color={C.accent}>{showHint ? "Hide hint" : "\ud83d\udca1 Hint"}</Btn>
        <Btn onClick={() => setShowSolution(!showSolution)} outline color={C.muted}>{showSolution ? "Hide solution" : "Show solution"}</Btn>
      </div>
      {showHint && <div style={{ marginBottom: 12, padding: "10px 14px", background: C.accent + "0d", border: `1px solid ${C.accent}33`, borderRadius: 8, fontFamily: mono, fontSize: 12, color: C.accent }}>\ud83d\udca1 {ch.hint}</div>}
      <AIFeedback result={feedback} loading={loading} />
      {showSolution && (
        <div style={{ marginTop: 14 }}>
          <div style={{ fontFamily: mono, fontSize: 9, color, letterSpacing: "0.12em", marginBottom: 8 }}>MODEL SOLUTION</div>
          <pre style={{ background: "#09090f", border: `1.5px solid ${color}44`, borderRadius: 10, padding: "16px 20px", margin: 0, color: C.text, fontFamily: mono, fontSize: 12, lineHeight: 1.8, overflowX: "auto", whiteSpace: "pre-wrap" }}>{ch.solution}</pre>
        </div>
      )}
    </div>
  );
}

// ── QUICKFIRE MODE ────────────────────────────────────────────────────────────

function QuickFireMode({ apiKey, onScore, onSessionComplete }) {
  const [shuffled] = useState(() => [...QUICKFIRE].sort(() => Math.random() - 0.5));
  const [idx, setIdx] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [history, setHistory] = useState([]);
  const [done, setDone] = useState(false);
  const q = shuffled[idx];

  const evaluate = async () => {
    if (!userAnswer.trim() || !apiKey) return;
    setLoading(true); setFeedback(null);
    const result = await checkAnswer({ type: "flashcard", question: q.q, correctAnswer: q.a, userAnswer, module: "general analytics", apiKey });
    setFeedback(result);
    setLoading(false);
  };

  const advance = (score) => {
    onScore("quickfire", idx, score, q);
    setHistory(h => [...h, score]);
    if (idx + 1 >= shuffled.length) { setDone(true); onSessionComplete(); return; }
    setIdx(idx + 1); setUserAnswer(""); setFeedback(null); setRevealed(false);
  };

  const strong = history.filter(v => v === "strong").length;
  const partial = history.filter(v => v === "partial").length;
  const weak = history.filter(v => v === "weak").length;

  if (done) return (
    <div style={{ textAlign: "center", padding: "40px 20px" }}>
      <div style={{ fontSize: 48, marginBottom: 14 }}>⚡</div>
      <div style={{ fontSize: 22, fontWeight: 700, color: C.text, marginBottom: 6 }}>Round Complete</div>
      <div style={{ fontFamily: mono, fontSize: 11, color: C.muted, marginBottom: 28 }}>{shuffled.length} QUESTIONS FIRED</div>
      <div style={{ display: "flex", gap: 28, justifyContent: "center", marginBottom: 32 }}>
        {[[C.ok, strong, "STRONG"], [C.warn, partial, "PARTIAL"], [C.err, weak, "WEAK"]].map(([col, val, label]) => (
          <div key={label} style={{ textAlign: "center" }}>
            <div style={{ fontSize: 36, fontWeight: 700, color: col }}>{val}</div>
            <div style={{ fontSize: 9, color: C.muted, fontFamily: mono, letterSpacing: "0.12em", marginTop: 4 }}>{label}</div>
          </div>
        ))}
      </div>
      <div style={{ fontSize: 32, fontWeight: 700, color: C.accent }}>{Math.round((strong / shuffled.length) * 100)}%</div>
      <div style={{ fontFamily: mono, fontSize: 10, color: C.muted, letterSpacing: "0.12em", marginBottom: 28 }}>STRONG RATE</div>
      <Btn onClick={() => { setIdx(0); setUserAnswer(""); setFeedback(null); setRevealed(false); setHistory([]); setDone(false); }}>Run Again ↺</Btn>
    </div>
  );

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14, alignItems: "center" }}>
        <div style={{ fontFamily: mono, fontSize: 11, color: C.muted }}>⚡ {idx + 1} / {shuffled.length}</div>
        <div style={{ display: "flex", gap: 12, fontFamily: mono, fontSize: 11 }}>
          <span style={{ color: C.ok }}>{strong} strong</span>
          <span style={{ color: C.warn }}>{partial} partial</span>
          <span style={{ color: C.err }}>{weak} weak</span>
        </div>
      </div>
      <div style={{ height: 3, background: C.border, borderRadius: 2, marginBottom: 20, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${(idx / shuffled.length) * 100}%`, background: C.accent, transition: "width 0.2s" }} />
      </div>
      <div style={{ background: C.card, border: `1.5px solid ${C.border}`, borderRadius: 12, padding: "18px 22px", marginBottom: 14 }}>
        <div style={{ fontFamily: mono, fontSize: 9, color: C.muted, letterSpacing: "0.12em", marginBottom: 10 }}>QUESTION</div>
        <div style={{ fontSize: 16, lineHeight: 1.65, color: C.text, fontWeight: 500 }}>{q.q}</div>
      </div>
      <div style={{ marginBottom: 10 }}>
        <div style={{ fontFamily: mono, fontSize: 9, color: C.muted, letterSpacing: "0.12em", marginBottom: 6 }}>YOUR ANSWER</div>
        <TArea value={userAnswer} onChange={setUserAnswer} placeholder="Answer fast — this is quick-fire..." rows={3} />
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
        <Btn onClick={evaluate} disabled={loading || !userAnswer.trim() || !apiKey} color={C.accent}>{loading ? "Checking..." : "⚡ Check"}</Btn>
        <Btn onClick={() => setRevealed(!revealed)} outline color={C.muted}>{revealed ? "Hide" : "Reveal"}</Btn>
        {feedback
          ? <Btn onClick={() => advance(feedback.score)} color={C.ok} outline>Next →</Btn>
          : <Btn onClick={() => advance("weak")} outline color={C.muted}>Skip →</Btn>
        }
      </div>
      <AIFeedback result={feedback} loading={loading} />
      {revealed && (
        <div style={{ marginTop: 14, padding: "12px 16px", background: C.accent + "0a", border: `1px solid ${C.accent}33`, borderRadius: 8 }}>
          <div style={{ fontFamily: mono, fontSize: 9, color: C.accent, letterSpacing: "0.12em", marginBottom: 6 }}>ANSWER</div>
          <div style={{ fontSize: 13, lineHeight: 1.7, color: C.text }}>{q.a}</div>
        </div>
      )}
    </div>
  );
}

// ── SESSION SUMMARY ────────────────────────────────────────────────────────────

function SessionSummary({ summary, onClose, onDrillWeaks }) {
  if (!summary) return null;
  const { mode, questionsAnswered, strong, partial, weak, durationMin, topMissed } = summary;
  const pct = questionsAnswered > 0 ? Math.round((strong / questionsAnswered) * 100) : 0;
  const grade = pct >= 85 ? { g: "A", col: C.ok } : pct >= 70 ? { g: "B", col: C.ok } : pct >= 55 ? { g: "C", col: C.warn } : { g: "D", col: C.err };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 20 }}>
      <div style={{ background: C.surface, border: `1.5px solid ${C.border}`, borderRadius: 16, padding: "28px 28px 24px", maxWidth: 460, width: "100%" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
          <div>
            <div style={{ fontFamily: mono, fontSize: 10, color: C.muted, letterSpacing: "0.12em", marginBottom: 4 }}>SESSION COMPLETE — {mode?.toUpperCase()}</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: C.text }}>{durationMin}min session</div>
          </div>
          <div style={{ fontSize: 36, fontWeight: 900, color: grade.col }}>{grade.g}</div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 20 }}>
          {[
            [questionsAnswered, "ANSWERED", C.text],
            [strong, "STRONG", C.ok],
            [partial, "PARTIAL", C.warn],
            [weak, "WEAK", C.err],
          ].map(([val, lbl, col]) => (
            <div key={lbl} style={{ textAlign: "center", background: C.card, borderRadius: 8, padding: "10px 4px" }}>
              <div style={{ fontSize: 24, fontWeight: 700, color: col }}>{val}</div>
              <div style={{ fontFamily: mono, fontSize: 8, color: C.muted, letterSpacing: "0.1em", marginTop: 2 }}>{lbl}</div>
            </div>
          ))}
        </div>

        {/* Strong rate bar */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontFamily: mono, fontSize: 10, color: C.muted, marginBottom: 5 }}>
            <span>Strong rate</span><span style={{ color: grade.col }}>{pct}%</span>
          </div>
          <div style={{ height: 6, background: C.border, borderRadius: 3, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${pct}%`, background: grade.col, borderRadius: 3, transition: "width 0.5s" }} />
          </div>
        </div>

        {/* Top missed topics */}
        {topMissed?.length > 0 && (
          <div style={{ marginBottom: 20, padding: "12px 14px", background: C.err + "0d", border: `1px solid ${C.err}33`, borderRadius: 8 }}>
            <div style={{ fontFamily: mono, fontSize: 9, color: C.err, letterSpacing: "0.12em", marginBottom: 8 }}>FOCUS AREAS</div>
            {topMissed.slice(0, 3).map((q, i) => (
              <div key={i} style={{ fontSize: 12, color: C.text, lineHeight: 1.5, marginBottom: 4, display: "flex", gap: 6 }}>
                <span style={{ color: C.err, flexShrink: 0 }}>✗</span>{q}
              </div>
            ))}
          </div>
        )}

        <div style={{ display: "flex", gap: 10 }}>
          {(weak > 0 || partial > 0) && (
            <button onClick={onDrillWeaks} style={{
              flex: 1, padding: "9px", background: C.err + "20", border: `1.5px solid ${C.err}55`,
              borderRadius: 7, fontFamily: mono, fontSize: 11, fontWeight: 700, color: C.err, cursor: "pointer"
            }}>🎯 Drill Weaks ({weak + partial})</button>
          )}
          <button onClick={onClose} style={{
            flex: 1, padding: "9px", background: C.accent, border: "none",
            borderRadius: 7, fontFamily: mono, fontSize: 11, fontWeight: 700, color: C.bg, cursor: "pointer"
          }}>Continue ✓</button>
        </div>
      </div>
    </div>
  );
}

// ── DOMAIN PACK MODE ───────────────────────────────────────────────────────────

function DomainPackMode({ pack, apiKey, progress, onScore, onSessionDone }) {
  const questions = pack.questions;
  const [idx, setIdx] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [sessionScores, setSessionScores] = useState({});
  const [sessionStart] = useState(Date.now());
  const card = questions[idx];

  const goTo = (i) => { setIdx(i); setUserAnswer(""); setFeedback(null); setRevealed(false); };

  const evaluate = async () => {
    if (!userAnswer.trim() || !apiKey) return;
    setLoading(true); setFeedback(null);
    const result = await checkAnswer({
      type: "flashcard", question: card.q, correctAnswer: card.a,
      userAnswer, module: `${pack.id} analytics`, apiKey
    });
    setFeedback(result);
    const newScores = { ...sessionScores, [idx]: result.score };
    setSessionScores(newScores);
    onScore(`domain-${pack.id}`, idx, result.score, card);
    setLoading(false);
  };

  const finishSession = () => {
    const strong = Object.values(sessionScores).filter(v => v === "strong").length;
    const partial = Object.values(sessionScores).filter(v => v === "partial").length;
    const weak = Object.values(sessionScores).filter(v => v === "weak").length;
    const answered = Object.keys(sessionScores).length;
    onSessionDone({
      mode: `${pack.label} Pack`,
      questionsAnswered: answered,
      strong, partial, weak,
      durationMin: Math.round((Date.now() - sessionStart) / 60000),
      topMissed: questions.filter((_, i) => sessionScores[i] === "weak").map(q => q.q).slice(0, 3),
    });
  };

  const strong = Object.values(sessionScores).filter(v => v === "strong").length;
  const partial = Object.values(sessionScores).filter(v => v === "partial").length;
  const weak = Object.values(sessionScores).filter(v => v === "weak").length;
  const persistedScore = progress.allTimeScores[`domain-${pack.id}:${idx}`];

  return (
    <div>
      {/* Pack header */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16, padding: "10px 14px", background: pack.color + "12", border: `1px solid ${pack.color}33`, borderRadius: 8 }}>
        <span style={{ fontSize: 18 }}>{pack.icon}</span>
        <div>
          <div style={{ fontFamily: mono, fontSize: 11, fontWeight: 700, color: pack.color }}>{pack.label}</div>
          <div style={{ fontFamily: mono, fontSize: 9, color: C.muted }}>{pack.description}</div>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 12, fontFamily: mono, fontSize: 11 }}>
          <span style={{ color: C.ok }}>✓ {strong}</span>
          <span style={{ color: C.warn }}>◑ {partial}</span>
          <span style={{ color: C.err }}>✗ {weak}</span>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10, alignItems: "center" }}>
        <span style={{ fontFamily: mono, fontSize: 11, color: C.muted }}>{idx + 1} / {questions.length}</span>
        {Object.keys(sessionScores).length >= 5 && (
          <button onClick={finishSession} style={{ fontFamily: mono, fontSize: 10, color: C.accent, background: "transparent", border: `1px solid ${C.accent}44`, borderRadius: 5, padding: "4px 10px", cursor: "pointer" }}>
            End & Summary →
          </button>
        )}
      </div>

      <div style={{ height: 3, background: C.border, borderRadius: 2, marginBottom: 20, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${(idx / questions.length) * 100}%`, background: pack.color, transition: "width 0.3s" }} />
      </div>

      <div style={{ background: C.card, border: `1.5px solid ${pack.color}33`, borderRadius: 12, padding: "20px 22px", marginBottom: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
          <Badge level={card.level} />
          {persistedScore && <ScorePill score={persistedScore} />}
        </div>
        <div style={{ fontSize: 15, lineHeight: 1.7, color: C.text, fontWeight: 500, whiteSpace: "pre-wrap" }}>{card.q}</div>
      </div>

      <div style={{ marginBottom: 10 }}>
        <div style={{ fontFamily: mono, fontSize: 9, color: C.muted, letterSpacing: "0.12em", marginBottom: 6 }}>YOUR ANSWER</div>
        <TArea value={userAnswer} onChange={setUserAnswer} placeholder="Answer as you would in an interview — include relevant context and examples..." rows={5} />
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
        <Btn onClick={evaluate} disabled={loading || !userAnswer.trim() || !apiKey} color={pack.color}>
          {loading ? "Checking..." : "⚡ Check My Answer"}
        </Btn>
        <Btn onClick={() => setRevealed(!revealed)} outline color={C.muted}>{revealed ? "Hide answer" : "Reveal answer"}</Btn>
        <Btn onClick={() => goTo((idx - 1 + questions.length) % questions.length)} outline color={C.muted}>← Prev</Btn>
        <Btn onClick={() => goTo((idx + 1) % questions.length)} outline color={C.muted}>Next →</Btn>
      </div>

      <AIFeedback result={feedback} loading={loading} />

      {revealed && (
        <div style={{ marginTop: 14, padding: "14px 18px", background: pack.color + "0a", border: `1.5px solid ${pack.color}33`, borderRadius: 10 }}>
          <div style={{ fontFamily: mono, fontSize: 9, color: pack.color, letterSpacing: "0.12em", marginBottom: 8 }}>MODEL ANSWER</div>
          <div style={{ fontSize: 13, lineHeight: 1.8, color: C.text, whiteSpace: "pre-wrap", fontFamily: mono }}>{card.a}</div>
        </div>
      )}
    </div>
  );
}

// ── WEAK QUEUE DRILL ──────────────────────────────────────────────────────────

function WeakQueueMode({ apiKey, progress, onScore }) {
  const queue = progress.weakQueue || [];
  const [idx, setIdx] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [cleared, setCleared] = useState([]);

  if (queue.length === 0) return (
    <div style={{ textAlign: "center", padding: "50px 20px" }}>
      <div style={{ fontSize: 40, marginBottom: 14 }}>✓</div>
      <div style={{ fontSize: 20, fontWeight: 700, color: C.ok, marginBottom: 8 }}>Queue Clear</div>
      <div style={{ fontFamily: mono, fontSize: 12, color: C.muted, lineHeight: 1.7 }}>
        No weak or partial answers flagged.<br />
        Keep practicing — flags appear when you score weak or partial on any question.
      </div>
    </div>
  );

  const remaining = queue.filter(w => !cleared.includes(w.key));

  if (remaining.length === 0) return (
    <div style={{ textAlign: "center", padding: "50px 20px" }}>
      <div style={{ fontSize: 40, marginBottom: 14 }}>🔥</div>
      <div style={{ fontSize: 20, fontWeight: 700, color: C.ok, marginBottom: 8 }}>Drill Complete!</div>
      <div style={{ fontFamily: mono, fontSize: 12, color: C.muted, marginBottom: 24 }}>
        You cleared all {cleared.length} flagged question{cleared.length !== 1 ? "s" : ""}.
      </div>
      <Btn onClick={() => setCleared([])}>Drill Again ↺</Btn>
    </div>
  );

  const safeIdx = Math.min(idx, remaining.length - 1);
  const item = remaining[safeIdx];

  // Resolve the actual flashcard from FLASHCARDS using mod + idx stored
  const allCards = Object.entries(FLASHCARDS).flatMap(([mod, cards]) =>
    cards.map((c, i) => ({ ...c, mod, cardIdx: i, key: `${mod}:${i}` }))
  );
  const card = allCards.find(c => c.key === item.key);
  const question = card?.q || item.q || "(Question not found)";
  const answer = card?.a || "";
  const modLabel = item.mod?.replace(/-code$/, "")?.toUpperCase() || "";
  const color = MODULES.find(m => m.id === item.mod?.replace(/-code$/, ""))?.color || C.accent;

  const goTo = (i) => { setIdx(i); setUserAnswer(""); setFeedback(null); setRevealed(false); };

  const evaluate = async () => {
    if (!userAnswer.trim() || !apiKey || !card) return;
    setLoading(true); setFeedback(null);
    const mod = item.mod?.replace(/-code$/, "") || "sql";
    const result = await checkAnswer({ type: "flashcard", question, correctAnswer: answer, userAnswer, module: mod, apiKey });
    setFeedback(result);
    setLoading(false);
    if (result.score === "strong") {
      onScore(item.mod, item.idx, result.score, { q: question });
      setTimeout(() => {
        setCleared(c => [...c, item.key]);
        const nextIdx = safeIdx >= remaining.length - 2 ? Math.max(0, safeIdx - 1) : safeIdx;
        goTo(nextIdx);
      }, 1200);
    } else {
      onScore(item.mod, item.idx, result.score, { q: question });
    }
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14, alignItems: "center" }}>
        <div style={{ fontFamily: mono, fontSize: 11, color: C.err }}>
          ✗ {remaining.length} in queue {cleared.length > 0 && <span style={{ color: C.ok }}>· {cleared.length} cleared this session</span>}
        </div>
        <span style={{ fontFamily: mono, fontSize: 11, color: C.muted }}>{safeIdx + 1} / {remaining.length}</span>
      </div>

      <div style={{ height: 3, background: C.border, borderRadius: 2, marginBottom: 20, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${(cleared.length / (cleared.length + remaining.length)) * 100}%`, background: C.ok, transition: "width 0.4s" }} />
      </div>

      <div style={{ background: C.card, border: `1.5px solid ${C.err}44`, borderRadius: 12, padding: "20px 22px", marginBottom: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {card && <Badge level={card.level} />}
            <span style={{ fontFamily: mono, fontSize: 9, color: color, letterSpacing: "0.1em" }}>{modLabel}</span>
          </div>
          <span style={{ fontFamily: mono, fontSize: 9, color: C.err, background: C.err + "15", padding: "2px 8px", borderRadius: 4 }}>NEEDS WORK</span>
        </div>
        <div style={{ fontSize: 16, lineHeight: 1.65, color: C.text, fontWeight: 500 }}>{question}</div>
      </div>

      <div style={{ marginBottom: 10 }}>
        <div style={{ fontFamily: mono, fontSize: 9, color: C.muted, letterSpacing: "0.12em", marginBottom: 6 }}>YOUR ANSWER — Score strong to clear this card</div>
        <TArea value={userAnswer} onChange={setUserAnswer} placeholder="Type your answer. Score Strong to remove from queue..." rows={4} />
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
        <Btn onClick={evaluate} disabled={loading || !userAnswer.trim() || !apiKey} color={C.err}>
          {loading ? "Checking..." : "⚡ Check"}
        </Btn>
        <Btn onClick={() => setRevealed(!revealed)} outline color={C.muted}>{revealed ? "Hide answer" : "Reveal answer"}</Btn>
        <Btn onClick={() => goTo(safeIdx > 0 ? safeIdx - 1 : remaining.length - 1)} outline color={C.muted}>← Prev</Btn>
        <Btn onClick={() => goTo((safeIdx + 1) % remaining.length)} outline color={C.muted}>Next →</Btn>
      </div>

      {feedback && (
        <div style={{ marginBottom: 14, padding: "10px 14px", background: feedback.score === "strong" ? C.ok + "15" : C.warn + "15", border: `1px solid ${feedback.score === "strong" ? C.ok : C.warn}44`, borderRadius: 8, fontFamily: mono, fontSize: 12 }}>
          {feedback.score === "strong"
            ? <span style={{ color: C.ok }}>✓ Strong! Removing from queue...</span>
            : <span style={{ color: C.warn }}>◑ {feedback.score === "partial" ? "Partial" : "Weak"} — keep drilling this one</span>
          }
          {feedback.coaching && <div style={{ color: C.text, marginTop: 6, lineHeight: 1.6 }}>{feedback.coaching}</div>}
        </div>
      )}

      <AIFeedback result={feedback} loading={loading} />

      {revealed && answer && (
        <div style={{ marginTop: 14, padding: "14px 18px", background: color + "0a", border: `1.5px solid ${color}33`, borderRadius: 10 }}>
          <div style={{ fontFamily: mono, fontSize: 9, color, letterSpacing: "0.12em", marginBottom: 8 }}>MODEL ANSWER</div>
          <div style={{ fontSize: 14, lineHeight: 1.75, color: C.text }}>{answer}</div>
        </div>
      )}
    </div>
  );
}

// ── INTERVIEW SIMULATION MODE ─────────────────────────────────────────────────

const INTERVIEW_POOL = Object.entries(FLASHCARDS).flatMap(([mod, cards]) =>
  cards.map((c, i) => ({ ...c, mod, cardIdx: i }))
);

function InterviewSimMode({ apiKey, onSessionComplete }) {
  const [phase, setPhase] = useState("config"); // config | active | debrief
  const [config, setConfig] = useState({ modules: ["sql", "excel", "tableau", "python"], difficulty: "Mixed", count: 10 });
  const [questions, setQuestions] = useState([]);
  const [qIdx, setQIdx] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [current, setCurrent] = useState("");
  const [timeLeft, setTimeLeft] = useState(90);
  const [timerActive, setTimerActive] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [results, setResults] = useState([]);
  const [debriefLoading, setDebriefLoading] = useState(false);

  // Timer
  useEffect(() => {
    if (!timerActive || phase !== "active") return;
    if (timeLeft <= 0) { submitAnswer(); return; }
    const t = setTimeout(() => setTimeLeft(n => n - 1), 1000);
    return () => clearTimeout(t);
  }, [timerActive, timeLeft, phase]);

  const startInterview = () => {
    let pool = INTERVIEW_POOL.filter(q => config.modules.includes(q.mod));
    if (config.difficulty !== "Mixed") pool = pool.filter(q => q.level === config.difficulty);
    if (pool.length === 0) pool = INTERVIEW_POOL;
    const shuffled = [...pool].sort(() => Math.random() - 0.5).slice(0, config.count);
    setQuestions(shuffled);
    setAnswers([]);
    setResults([]);
    setQIdx(0);
    setCurrent("");
    setTimeLeft(90);
    setTimerActive(true);
    setPhase("active");
  };

  const submitAnswer = async () => {
    if (evaluating) return;
    setTimerActive(false);
    setEvaluating(true);
    const q = questions[qIdx];
    const ans = current.trim() || "(no answer)";
    const result = await checkAnswer({
      type: "flashcard", question: q.q, correctAnswer: q.a, userAnswer: ans, module: q.mod, apiKey
    });
    const newResults = [...results, { q: q.q, a: q.a, userAnswer: ans, mod: q.mod, level: q.level, score: result }];
    setResults(newResults);
    setAnswers(prev => [...prev, ans]);
    setEvaluating(false);

    if (qIdx + 1 >= questions.length) {
      setPhase("debrief");
      if (onSessionComplete) onSessionComplete();
    } else {
      setQIdx(qIdx + 1);
      setCurrent("");
      setTimeLeft(90);
      setTimerActive(true);
    }
  };

  const letterGrade = (pct) => {
    if (pct >= 85) return { grade: "A", color: C.ok, label: "Strong candidate" };
    if (pct >= 70) return { grade: "B", color: C.ok, label: "Above average" };
    if (pct >= 55) return { grade: "C", color: C.warn, label: "Mixed performance" };
    return { grade: "D", color: C.err, label: "Needs more prep" };
  };

  if (phase === "config") return (
    <div>
      <div style={{ fontFamily: mono, fontSize: 10, color: C.muted, letterSpacing: "0.12em", marginBottom: 18 }}>CONFIGURE INTERVIEW</div>

      <div style={{ background: C.card, border: `1.5px solid ${C.border}`, borderRadius: 12, padding: "20px 22px", marginBottom: 16 }}>
        <div style={{ fontFamily: mono, fontSize: 10, color: C.muted, letterSpacing: "0.1em", marginBottom: 12 }}>MODULES</div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {MODULES.map(m => {
            const on = config.modules.includes(m.id);
            return (
              <button key={m.id} onClick={() => setConfig(c => ({
                ...c,
                modules: on && c.modules.length > 1 ? c.modules.filter(x => x !== m.id) : on ? c.modules : [...c.modules, m.id]
              }))} style={{
                padding: "6px 14px", borderRadius: 6, fontFamily: mono, fontSize: 12, fontWeight: 600, cursor: "pointer",
                background: on ? m.color : "transparent",
                color: on ? C.bg : m.color,
                border: `1.5px solid ${m.color}`,
              }}>{m.icon} {m.label}</button>
            );
          })}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
        <div style={{ background: C.card, border: `1.5px solid ${C.border}`, borderRadius: 12, padding: "16px 20px" }}>
          <div style={{ fontFamily: mono, fontSize: 10, color: C.muted, letterSpacing: "0.1em", marginBottom: 10 }}>DIFFICULTY</div>
          {["Mixed", "Basic", "Intermediate", "Advanced"].map(d => (
            <button key={d} onClick={() => setConfig(c => ({ ...c, difficulty: d }))} style={{
              display: "block", width: "100%", textAlign: "left", padding: "6px 10px", marginBottom: 4, borderRadius: 5,
              background: config.difficulty === d ? C.accent + "20" : "transparent",
              border: `1px solid ${config.difficulty === d ? C.accent : C.border}`,
              fontFamily: mono, fontSize: 11, color: config.difficulty === d ? C.accent : C.muted, cursor: "pointer",
            }}>{d}</button>
          ))}
        </div>

        <div style={{ background: C.card, border: `1.5px solid ${C.border}`, borderRadius: 12, padding: "16px 20px" }}>
          <div style={{ fontFamily: mono, fontSize: 10, color: C.muted, letterSpacing: "0.1em", marginBottom: 10 }}>QUESTIONS</div>
          {[5, 8, 10, 15].map(n => (
            <button key={n} onClick={() => setConfig(c => ({ ...c, count: n }))} style={{
              display: "block", width: "100%", textAlign: "left", padding: "6px 10px", marginBottom: 4, borderRadius: 5,
              background: config.count === n ? C.accent + "20" : "transparent",
              border: `1px solid ${config.count === n ? C.accent : C.border}`,
              fontFamily: mono, fontSize: 11, color: config.count === n ? C.accent : C.muted, cursor: "pointer",
            }}>{n} questions</button>
          ))}
        </div>
      </div>

      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: "12px 16px", marginBottom: 20, fontFamily: mono, fontSize: 11, color: C.muted, lineHeight: 1.7 }}>
        <span style={{ color: C.warn }}>RULES: </span>
        No hints. No reveals. 90 seconds per question. Unanswered questions auto-submit. AI grades every answer. You get a letter grade at the end.
      </div>

      <Btn onClick={startInterview} disabled={!apiKey} style={{ padding: "10px 28px", fontSize: 13, width: "100%" }}>
        {apiKey ? "🎙 Start Interview" : "Add API key to start"}
      </Btn>
    </div>
  );

  if (phase === "active") {
    const q = questions[qIdx];
    const modColor = MODULES.find(m => m.id === q.mod)?.color || C.accent;
    const timerPct = (timeLeft / 90) * 100;
    const timerColor = timeLeft > 30 ? C.ok : timeLeft > 10 ? C.warn : C.err;

    return (
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14, alignItems: "center" }}>
          <div style={{ fontFamily: mono, fontSize: 11, color: C.muted }}>🎙 Q{qIdx + 1} / {questions.length}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ fontFamily: mono, fontSize: 18, fontWeight: 700, color: timerColor }}>{timeLeft}s</div>
            {evaluating && <Spinner />}
          </div>
        </div>

        {/* Timer bar */}
        <div style={{ height: 4, background: C.border, borderRadius: 2, marginBottom: 20, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${timerPct}%`, background: timerColor, transition: "width 1s linear" }} />
        </div>

        <div style={{ background: C.card, border: `1.5px solid ${modColor}33`, borderRadius: 12, padding: "20px 22px", marginBottom: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <Badge level={q.level} />
            <span style={{ fontFamily: mono, fontSize: 9, color: modColor, letterSpacing: "0.1em" }}>{q.mod.toUpperCase()}</span>
          </div>
          <div style={{ fontSize: 16, lineHeight: 1.65, color: C.text, fontWeight: 500 }}>{q.q}</div>
        </div>

        <div style={{ marginBottom: 12 }}>
          <div style={{ fontFamily: mono, fontSize: 9, color: C.muted, letterSpacing: "0.12em", marginBottom: 6 }}>YOUR ANSWER</div>
          <TArea value={current} onChange={setCurrent} placeholder="Answer as you would in a real interview — no hints, no reveals..." rows={5} />
        </div>

        <Btn onClick={submitAnswer} disabled={evaluating} color={modColor} style={{ width: "100%", padding: "10px" }}>
          {evaluating ? "Evaluating..." : qIdx + 1 === questions.length ? "Submit Final Answer →" : "Submit Answer →"}
        </Btn>
      </div>
    );
  }

  if (phase === "debrief") {
    const strongCount = results.filter(r => r.score.score === "strong").length;
    const partialCount = results.filter(r => r.score.score === "partial").length;
    const weakCount = results.filter(r => r.score.score === "weak").length;
    const pct = Math.round((strongCount / results.length) * 100);
    const { grade, color: gradeColor, label } = letterGrade(pct);

    return (
      <div>
        {/* Header */}
        <div style={{ textAlign: "center", padding: "24px 0 20px", borderBottom: `1px solid ${C.border}`, marginBottom: 20 }}>
          <div style={{ fontSize: 52, fontWeight: 900, color: gradeColor, marginBottom: 4 }}>{grade}</div>
          <div style={{ fontFamily: mono, fontSize: 11, color: C.muted, letterSpacing: "0.1em", marginBottom: 14 }}>{label.toUpperCase()}</div>
          <div style={{ display: "flex", gap: 24, justifyContent: "center" }}>
            {[[C.ok, strongCount, "STRONG"], [C.warn, partialCount, "PARTIAL"], [C.err, weakCount, "WEAK"]].map(([col, val, lbl]) => (
              <div key={lbl} style={{ textAlign: "center" }}>
                <div style={{ fontSize: 28, fontWeight: 700, color: col }}>{val}</div>
                <div style={{ fontSize: 9, color: C.muted, fontFamily: mono, letterSpacing: "0.1em" }}>{lbl}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Per-question review */}
        <div style={{ fontFamily: mono, fontSize: 10, color: C.muted, letterSpacing: "0.12em", marginBottom: 12 }}>QUESTION REVIEW</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
          {results.map((r, i) => {
            const [scoreCol] = { strong: [C.ok], partial: [C.warn], weak: [C.err] }[r.score.score] || [C.err];
            const modColor = MODULES.find(m => m.id === r.mod)?.color || C.accent;
            return (
              <div key={i} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, overflow: "hidden" }}>
                <div style={{ padding: "10px 14px", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <span style={{ fontFamily: mono, fontSize: 10, color: C.muted }}>Q{i + 1}</span>
                    <Badge level={r.level} />
                    <span style={{ fontFamily: mono, fontSize: 9, color: modColor }}>{r.mod.toUpperCase()}</span>
                  </div>
                  <ScorePill score={r.score.score} />
                </div>
                <div style={{ padding: "10px 14px" }}>
                  <div style={{ fontSize: 13, color: C.text, fontWeight: 500, marginBottom: 8, lineHeight: 1.5 }}>{r.q}</div>
                  {r.score.coaching && (
                    <div style={{ fontFamily: mono, fontSize: 11, color: C.muted, lineHeight: 1.6 }}>
                      <span style={{ color: C.accent }}>COACH: </span>{r.score.coaching}
                    </div>
                  )}
                  <details style={{ marginTop: 8 }}>
                    <summary style={{ fontFamily: mono, fontSize: 10, color: C.muted, cursor: "pointer", letterSpacing: "0.08em" }}>VIEW MODEL ANSWER</summary>
                    <div style={{ marginTop: 8, padding: "10px 12px", background: modColor + "0a", borderRadius: 6, fontSize: 12, lineHeight: 1.7, color: C.text }}>{r.a}</div>
                  </details>
                </div>
              </div>
            );
          })}
        </div>

        <Btn onClick={() => setPhase("config")} outline color={C.muted} style={{ width: "100%", padding: "10px" }}>
          ← Configure New Interview
        </Btn>
      </div>
    );
  }

  return null;
}


// ── SQL INTERVIEW PREP ────────────────────────────────────────────────────────

const SQL_LESSONS = [
  {
    id: "order_of_execution",
    label: "SQL Order of Execution",
    icon: "⬡",
    summary: "SQL does not execute in the order you write it. Understanding the logical execution order prevents common mistakes like using SELECT aliases in WHERE clauses.",
    steps: [
      {
        title: "The Logical Execution Order",
        explanation: "SQL processes clauses in this order, regardless of how you write the query: FROM and JOIN first (build the data set), then WHERE (filter rows), then GROUP BY (group them), then HAVING (filter groups), then SELECT (choose columns), then DISTINCT (remove duplicates), then ORDER BY (sort), then LIMIT or TOP (trim rows).",
        code: `-- You write it like this:
SELECT region, SUM(revenue) AS total
FROM orders
WHERE year = 2024
GROUP BY region
HAVING SUM(revenue) > 50000
ORDER BY total DESC
LIMIT 5;

-- But SQL executes it like this:
-- 1. FROM orders
-- 2. WHERE year = 2024
-- 3. GROUP BY region
-- 4. HAVING SUM(revenue) > 50000
-- 5. SELECT region, SUM(revenue) AS total
-- 6. ORDER BY total DESC
-- 7. LIMIT 5`
      },
      {
        title: "Why This Matters: Aliases",
        explanation: "Because SELECT runs after WHERE and GROUP BY, you cannot use a SELECT alias in those clauses. The alias does not exist yet when WHERE and GROUP BY run. You CAN use it in ORDER BY because ORDER BY runs after SELECT.",
        code: `-- This FAILS — WHERE runs before SELECT, alias does not exist yet:
SELECT SUM(revenue) AS total
FROM orders
WHERE total > 50000;  -- ERROR

-- Fix: repeat the expression in WHERE:
SELECT SUM(revenue) AS total
FROM orders
GROUP BY region
HAVING SUM(revenue) > 50000;  -- WORKS

-- This WORKS — ORDER BY runs after SELECT:
SELECT SUM(revenue) AS total
FROM orders
GROUP BY region
ORDER BY total DESC;  -- alias is fine here`
      },
    ]
  },
  {
    id: "where_vs_having",
    label: "WHERE vs HAVING",
    icon: "◈",
    summary: "WHERE and HAVING both filter data, but at different stages. Knowing which to use and why makes your queries faster and more accurate.",
    steps: [
      {
        title: "The Core Difference",
        explanation: "WHERE filters individual rows before grouping. You cannot use aggregate functions like SUM() or COUNT() in WHERE. HAVING filters groups after aggregation. You must use HAVING when your condition involves an aggregate. Think of it this way: WHERE says which rows to include, HAVING says which groups to keep.",
        code: `-- WHERE filters rows before GROUP BY:
SELECT region, SUM(revenue) AS total
FROM orders
WHERE order_date >= '2024-01-01'  -- row-level filter
GROUP BY region;

-- HAVING filters groups after GROUP BY:
SELECT region, SUM(revenue) AS total
FROM orders
GROUP BY region
HAVING SUM(revenue) > 100000;  -- group-level filter

-- Both together:
SELECT region, SUM(revenue) AS total
FROM orders
WHERE order_date >= '2024-01-01'  -- filter rows first
GROUP BY region
HAVING SUM(revenue) > 100000;    -- then filter groups`
      },
      {
        title: "Performance Tip",
        explanation: "Always filter with WHERE when possible instead of HAVING. WHERE reduces rows before GROUP BY processes them, which means less data to aggregate. HAVING can only filter after the full aggregation is done. If a condition does not require an aggregate function, put it in WHERE.",
        code: `-- Slow: HAVING filters after aggregating ALL rows
SELECT region, SUM(revenue)
FROM orders
GROUP BY region
HAVING region = 'West';  -- wrong place for this

-- Fast: WHERE filters BEFORE aggregation
SELECT region, SUM(revenue)
FROM orders
WHERE region = 'West'    -- reduces rows early
GROUP BY region;`
      },
    ]
  },
  {
    id: "pivot",
    label: "Rows to Columns (Pivot)",
    icon: "◉",
    summary: "Pivoting rotates row values into columns. SQL does not always have a built-in PIVOT function, but conditional aggregation works in every dialect.",
    steps: [
      {
        title: "Rows to Columns with CASE WHEN",
        explanation: "The standard approach is conditional aggregation: use a CASE WHEN inside an aggregate function to create one column per category. This works in MySQL, PostgreSQL, BigQuery, Snowflake, and SQL Server — no special syntax required.",
        code: `-- Source data (rows):
-- product | month | revenue
-- Widget  | Jan   | 1000
-- Widget  | Feb   | 1200
-- Gadget  | Jan   | 800

-- Pivot to columns:
SELECT
  product,
  SUM(CASE WHEN month = 'Jan' THEN revenue END) AS Jan,
  SUM(CASE WHEN month = 'Feb' THEN revenue END) AS Feb,
  SUM(CASE WHEN month = 'Mar' THEN revenue END) AS Mar
FROM sales
GROUP BY product;

-- Result:
-- product | Jan  | Feb  | Mar
-- Widget  | 1000 | 1200 | NULL
-- Gadget  | 800  | NULL | NULL`
      },
      {
        title: "Columns to Rows (Unpivot)",
        explanation: "To go the other direction — columns back to rows — use UNION ALL. Each SELECT block pulls one column and labels it as a row. This is the cross-dialect approach to unpivoting.",
        code: `-- Source data (columns):
-- product | jan_rev | feb_rev | mar_rev

-- Unpivot to rows:
SELECT product, 'Jan' AS month, jan_rev AS revenue
FROM sales
UNION ALL
SELECT product, 'Feb', feb_rev
FROM sales
UNION ALL
SELECT product, 'Mar', mar_rev
FROM sales
ORDER BY product, month;`
      },
    ]
  },
  {
    id: "self_join",
    label: "Self Join",
    icon: "◆",
    summary: "A self join lets a table reference itself. It is essential when rows in a table point to other rows in the same table, like employees and managers.",
    steps: [
      {
        title: "The Pattern",
        explanation: "To self join, give the same table two different aliases and join it to itself on the relationship between rows. The most common use case is an org chart: employees and managers stored in the same table.",
        code: `-- Table: employees (employee_id, name, manager_id)

-- Find each employee and their manager's name:
SELECT
  e.name AS employee,
  m.name AS manager
FROM employees e
LEFT JOIN employees m
  ON e.manager_id = m.employee_id;

-- LEFT JOIN keeps employees with no manager (like the CEO)
-- INNER JOIN would drop them`
      },
      {
        title: "Finding Pairs",
        explanation: "Self joins also find relationships between rows of the same type — like employees in the same department. Use a.id < b.id to avoid duplicate pairs and self-matching.",
        code: `-- Find all employee pairs in the same department:
SELECT
  a.name AS emp1,
  b.name AS emp2,
  a.dept
FROM employees a
JOIN employees b
  ON a.dept = b.dept
  AND a.id < b.id;  -- prevents (Bob,Alice) AND (Alice,Bob)
                   -- and prevents (Alice,Alice)`
      },
    ]
  },
  {
    id: "joins",
    label: "JOIN Types",
    icon: "⬡",
    summary: "JOINs combine rows from multiple tables. Each type handles missing matches differently. Understanding the difference prevents data loss and row multiplication.",
    steps: [
      {
        title: "The Four Main JOIN Types",
        explanation: "INNER JOIN returns only rows with matches on both sides. LEFT JOIN returns all left rows plus matches from the right (NULL where no match). RIGHT JOIN is the mirror of LEFT. FULL OUTER JOIN returns everything from both sides with NULLs where no match exists. In practice, LEFT JOIN is by far the most common.",
        code: `-- INNER JOIN: only matched rows
SELECT o.order_id, c.name
FROM orders o
INNER JOIN customers c ON o.customer_id = c.id;

-- LEFT JOIN: all orders, even without a customer match
SELECT o.order_id, c.name
FROM orders o
LEFT JOIN customers c ON o.customer_id = c.id;
-- c.name is NULL where no customer found

-- FULL OUTER JOIN: all orders AND all customers
SELECT o.order_id, c.name
FROM orders o
FULL OUTER JOIN customers c ON o.customer_id = c.id;`
      },
      {
        title: "Row Multiplication Warning",
        explanation: "If your join produces more rows than you started with, the table you joined to has duplicate values in the join column. Always check for this. Diagnose with a COUNT, then deduplicate before joining.",
        code: `-- Diagnose duplicates in customers table:
SELECT customer_id, COUNT(*)
FROM customers
GROUP BY customer_id
HAVING COUNT(*) > 1;

-- Fix: deduplicate first with ROW_NUMBER
WITH unique_customers AS (
  SELECT *,
    ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY updated_at DESC) AS rn
  FROM customers
)
SELECT o.order_id, c.name
FROM orders o
JOIN unique_customers c
  ON o.customer_id = c.customer_id
  AND c.rn = 1;`
      },
    ]
  },
  {
    id: "count_variants",
    label: "COUNT Variants",
    icon: "◈",
    summary: "COUNT has several forms that behave differently around NULLs. Using the wrong one gives you a silently wrong number.",
    steps: [
      {
        title: "COUNT(*) vs COUNT(column)",
        explanation: "COUNT(*) counts every row including those with NULLs. COUNT(column) counts only rows where that column is not NULL. COUNT(1) and COUNT(0) are identical to COUNT(*) — the literal value is never NULL so every row counts.",
        code: `-- Table: users (user_id, email)
-- 100 rows total, 20 have NULL email

SELECT
  COUNT(*)      AS total_rows,       -- 100
  COUNT(1)      AS also_total,        -- 100
  COUNT(email)  AS non_null_emails,   -- 80
  COUNT(*) - COUNT(email) AS null_emails  -- 20
FROM users;

-- COUNT(DISTINCT column) counts unique non-null values:
SELECT COUNT(DISTINCT region) AS unique_regions
FROM orders;`
      },
    ]
  },
  {
    id: "aggregations",
    label: "SQL Aggregations",
    icon: "◉",
    summary: "Aggregations collapse many rows into summary values. Mastering them plus window functions covers most analytics work.",
    steps: [
      {
        title: "The Five Core Aggregates",
        explanation: "COUNT, SUM, AVG, MIN, and MAX are the foundation. All of them ignore NULL values except COUNT(*). They all require GROUP BY when combined with non-aggregated columns in SELECT.",
        code: `SELECT
  region,
  COUNT(*)           AS order_count,
  SUM(revenue)       AS total_revenue,
  AVG(revenue)       AS avg_order_value,
  MIN(revenue)       AS smallest_order,
  MAX(revenue)       AS largest_order
FROM orders
GROUP BY region
ORDER BY total_revenue DESC;`
      },
      {
        title: "Percentage of Total with Window Functions",
        explanation: "A common pattern: show each group value AND its percentage of the overall total in one query. Use a window function nested inside an aggregate to get the grand total without a subquery.",
        code: `SELECT
  region,
  SUM(revenue) AS region_revenue,
  ROUND(
    SUM(revenue) * 100.0 / SUM(SUM(revenue)) OVER (),
    2
  ) AS pct_of_total
FROM orders
GROUP BY region
ORDER BY region_revenue DESC;

-- SUM(SUM(revenue)) OVER () is the grand total
-- The inner SUM groups by region
-- The outer SUM() OVER () removes the partition, summing all groups`
      },
    ]
  },
  {
    id: "duplicates",
    label: "Finding and Removing Duplicates",
    icon: "◆",
    summary: "Duplicate rows are one of the most common data quality issues. SQL gives you precise tools to find them, investigate them, and remove only what you want.",
    steps: [
      {
        title: "Finding Duplicates",
        explanation: "Use GROUP BY with HAVING COUNT(*) > 1 to find which values appear more than once. To see the full rows of duplicates, use a subquery or IN clause.",
        code: `-- Find which emails are duplicated:
SELECT email, COUNT(*) AS occurrences
FROM customers
GROUP BY email
HAVING COUNT(*) > 1
ORDER BY occurrences DESC;

-- See all columns of duplicate rows:
SELECT *
FROM customers
WHERE email IN (
  SELECT email
  FROM customers
  GROUP BY email
  HAVING COUNT(*) > 1
);`
      },
      {
        title: "Removing Duplicates with ROW_NUMBER()",
        explanation: "ROW_NUMBER() is the standard tool for deduplication. Partition by the duplicate key, order by whichever row you want to keep (lowest id, most recent date, etc.), then delete or filter where rn > 1.",
        code: `-- Keep the most recent duplicate per customer_id:
WITH ranked AS (
  SELECT *,
    ROW_NUMBER() OVER (
      PARTITION BY customer_id
      ORDER BY updated_at DESC  -- most recent = rn 1
    ) AS rn
  FROM customers
)
-- First: SELECT to verify what you will delete
SELECT * FROM ranked WHERE rn > 1;

-- Then: DELETE
DELETE FROM customers
WHERE id IN (
  SELECT id FROM ranked WHERE rn > 1
);
-- Always SELECT before DELETE`
      },
    ]
  },
  {
    id: "window_rank",
    label: "RANK, DENSE_RANK, ROW_NUMBER",
    icon: "⬡",
    summary: "These three window functions all assign numbers to rows, but handle ties differently. Picking the wrong one is a common interview mistake.",
    steps: [
      {
        title: "How Each One Handles Ties",
        explanation: "Given scores of 100, 100, 90: ROW_NUMBER gives 1, 2, 3 — unique numbers, ties broken arbitrarily. RANK gives 1, 1, 3 — ties share the same rank, next rank skips. DENSE_RANK gives 1, 1, 2 — ties share the same rank, no skipping.",
        code: `SELECT
  name,
  score,
  ROW_NUMBER()   OVER (ORDER BY score DESC) AS row_num,
  RANK()         OVER (ORDER BY score DESC) AS rnk,
  DENSE_RANK()   OVER (ORDER BY score DESC) AS dense_rnk
FROM scores;

-- Results:
-- name  | score | row_num | rnk | dense_rnk
-- Alice | 100   | 1       | 1   | 1
-- Bob   | 100   | 2       | 1   | 1
-- Carol | 90    | 3       | 3   | 2`
      },
      {
        title: "Top-1 Per Group Pattern",
        explanation: "The most tested use of ROW_NUMBER: return exactly one row per group. Partition by the group key, order by what defines the winner, filter where rn = 1. Use ROW_NUMBER here, not RANK, because RANK can return multiple rows when there are ties.",
        code: `-- Return the most recent order per customer:
WITH ranked AS (
  SELECT *,
    ROW_NUMBER() OVER (
      PARTITION BY customer_id
      ORDER BY order_date DESC
    ) AS rn
  FROM orders
)
SELECT order_id, customer_id, order_date, amount
FROM ranked
WHERE rn = 1;

-- ROW_NUMBER guarantees exactly one row per customer
-- RANK would return multiple rows if two orders share the same date`
      },
    ]
  },
  {
    id: "first_last_value",
    label: "FIRST_VALUE and LAST_VALUE",
    icon: "◈",
    summary: "FIRST_VALUE and LAST_VALUE retrieve values from the first or last row in a window. LAST_VALUE has a critical gotcha that trips up most analysts.",
    steps: [
      {
        title: "FIRST_VALUE",
        explanation: "FIRST_VALUE returns the value from the first row in the window, based on your ORDER BY. It is useful for comparing each row to a baseline — like the first sale of the year or the founding salary in a department.",
        code: `-- Show each employee salary vs the first person hired in their dept:
SELECT
  name,
  dept,
  salary,
  hire_date,
  FIRST_VALUE(salary) OVER (
    PARTITION BY dept
    ORDER BY hire_date
  ) AS first_hire_salary
FROM employees;`
      },
      {
        title: "LAST_VALUE — The Gotcha",
        explanation: "By default, LAST_VALUE only looks up to the current row, not the end of the partition. This means it returns the current row value instead of the actual last. You must add an explicit frame to fix it.",
        code: `-- WRONG: returns current row salary, not the last hired salary
SELECT
  name,
  LAST_VALUE(salary) OVER (
    PARTITION BY dept
    ORDER BY hire_date
  ) AS wrong_result;

-- CORRECT: extend the frame to end of partition
SELECT
  name,
  LAST_VALUE(salary) OVER (
    PARTITION BY dept
    ORDER BY hire_date
    ROWS BETWEEN UNBOUNDED PRECEDING
             AND UNBOUNDED FOLLOWING  -- this is the fix
  ) AS last_hire_salary
FROM employees;`
      },
    ]
  },
  {
    id: "rollup_cube",
    label: "ROLLUP, CUBE, GROUPING SETS",
    icon: "◉",
    summary: "These extensions to GROUP BY generate subtotals and grand totals automatically, replacing what used to require multiple UNION ALL queries.",
    steps: [
      {
        title: "ROLLUP — Hierarchical Subtotals",
        explanation: "ROLLUP generates subtotals along a hierarchy. For GROUP BY ROLLUP(region, product), you get one row per region-product combination, one subtotal per region, and one grand total row. NULL in the result marks subtotal and grand total rows.",
        code: `SELECT
  region,
  product,
  SUM(revenue) AS total
FROM orders
GROUP BY ROLLUP(region, product)
ORDER BY region, product;

-- Results include:
-- West | Widget | 5000   (detail row)
-- West | Gadget | 3000   (detail row)
-- West | NULL   | 8000   (region subtotal)
-- NULL | NULL   | 15000  (grand total)

-- Use GROUPING(region) = 1 to identify rollup NULLs vs real NULLs`
      },
      {
        title: "CUBE and GROUPING SETS",
        explanation: "CUBE generates every possible combination of groupings. GROUPING SETS lets you specify exactly which groupings you want. Use CUBE for multidimensional dashboards, GROUPING SETS when you need a specific custom set of summaries.",
        code: `-- CUBE: all combinations of region and product
GROUP BY CUBE(region, product)
-- Gives: (region,product), (region), (product), ()

-- GROUPING SETS: only the combinations you specify
GROUP BY GROUPING SETS(
  (region, product),  -- detail
  (region),           -- region subtotal only
  ()                  -- grand total only
)
-- Skips the (product) subtotal that CUBE would include`
      },
    ]
  },
  {
    id: "slowly_changing",
    label: "Slowly Changing Dimensions",
    icon: "◆",
    summary: "SCDs are how data warehouses track changes to dimension data over time. Type 2 is the standard and the most important to understand.",
    steps: [
      {
        title: "Type 1, 2, and 3",
        explanation: "Type 1 overwrites the old value — simple, but history is lost. Type 2 adds a new row for each change and keeps the old row with an end date — full history preserved, most common in analytics. Type 3 adds a column for the previous value — keeps one prior version only.",
        code: `-- Type 2 SCD table structure:
-- customer_id | region | start_date | end_date   | is_current
-- 101         | West   | 2022-01-01 | 2023-06-14 | FALSE
-- 101         | East   | 2023-06-15 | NULL       | TRUE

-- Query: what was this customer's region on a specific date?
SELECT region
FROM customer_dim
WHERE customer_id = 101
  AND start_date <= '2023-01-01'
  AND (end_date > '2023-01-01' OR end_date IS NULL);
-- Returns: West (they had not moved yet)`
      },
    ]
  },
  {
    id: "merge",
    label: "SQL MERGE Statement",
    icon: "⬡",
    summary: "MERGE handles INSERT, UPDATE, and DELETE in one statement based on whether rows match between a source and target table.",
    steps: [
      {
        title: "How MERGE Works",
        explanation: "MERGE compares a source table to a target table row by row. When a row matches, you can UPDATE it. When it does not match in the target, you INSERT it. Some dialects also allow DELETE on match. This replaces the common pattern of separate UPDATE and INSERT statements.",
        code: `-- Sync new_customers into customers table:
MERGE customers AS target
USING new_customers AS source
  ON target.customer_id = source.customer_id

WHEN MATCHED THEN
  UPDATE SET
    target.region = source.region,
    target.updated_at = GETDATE()

WHEN NOT MATCHED BY TARGET THEN
  INSERT (customer_id, name, region, created_at)
  VALUES (source.customer_id, source.name, source.region, GETDATE());

-- Note: PostgreSQL uses INSERT ... ON CONFLICT instead of MERGE
-- Always test the join condition with SELECT before running MERGE`
      },
    ]
  },
  {
    id: "views_materialized",
    label: "Views vs Materialized Views",
    icon: "◈",
    summary: "Both are saved queries, but one stores the results and one does not. The difference matters for performance and freshness.",
    steps: [
      {
        title: "Regular Views",
        explanation: "A regular view is a saved query — it runs fresh every time you query it. No data is stored. The view is always current but adds the cost of running the underlying query on each access. Best for simplicity and when data must always be real-time.",
        code: `-- Create a view:
CREATE VIEW regional_summary AS
SELECT region, SUM(revenue) AS total
FROM orders
GROUP BY region;

-- Query it like a table (runs the query fresh each time):
SELECT * FROM regional_summary WHERE region = 'West';`
      },
      {
        title: "Materialized Views",
        explanation: "A materialized view stores the query result physically on disk. Querying it is fast because the data is pre-computed. The tradeoff is staleness — you must refresh it manually or on a schedule. Use for expensive aggregations that run frequently and can tolerate being slightly behind.",
        code: `-- Create a materialized view (Snowflake / PostgreSQL syntax):
CREATE MATERIALIZED VIEW regional_summary_mat AS
SELECT region, SUM(revenue) AS total
FROM orders
GROUP BY region;

-- Refresh when source data changes:
REFRESH MATERIALIZED VIEW regional_summary_mat;

-- Use when:
-- The query joins many large tables
-- It is queried dozens of times per hour
-- Hour-old data is acceptable for the report`
      },
    ]
  },
  {
    id: "advanced",
    label: "Advanced Patterns",
    icon: "◉",
    summary: "The patterns that separate a good SQL writer from a strong analyst. Running totals, month-over-month growth, rolling windows, and Nth value queries.",
    steps: [
      {
        title: "Running Total",
        explanation: "A running total accumulates a value as you move down ordered rows. Always use ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW explicitly — without it, duplicate dates can produce unexpected results.",
        code: `SELECT
  order_date,
  amount,
  SUM(amount) OVER (
    ORDER BY order_date
    ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
  ) AS running_total
FROM orders
ORDER BY order_date;`
      },
      {
        title: "Month-over-Month Growth",
        explanation: "Use LAG() to pull the prior month value alongside the current month, then calculate the percentage change. NULLIF prevents divide-by-zero when the prior month is zero.",
        code: `WITH monthly AS (
  SELECT
    DATE_TRUNC('month', sale_date) AS month,
    SUM(revenue) AS revenue
  FROM sales
  GROUP BY 1
)
SELECT
  month,
  revenue,
  LAG(revenue) OVER (ORDER BY month) AS prev_month,
  ROUND(
    (revenue - LAG(revenue) OVER (ORDER BY month)) * 100.0
    / NULLIF(LAG(revenue) OVER (ORDER BY month), 0),
  2) AS mom_pct_change
FROM monthly
ORDER BY month;`
      },
      {
        title: "Rolling 7-Day Window",
        explanation: "Count events within a rolling window per user or entity. This pattern is used in fraud detection, engagement scoring, and churn analysis.",
        code: `-- Flag customers with 3+ purchases in any 7-day window:
WITH windowed AS (
  SELECT
    customer_id,
    transaction_date,
    COUNT(*) OVER (
      PARTITION BY customer_id
      ORDER BY transaction_date
      RANGE BETWEEN INTERVAL '6' DAY PRECEDING
               AND CURRENT ROW
    ) AS purchases_in_7_days
  FROM transactions
)
SELECT DISTINCT customer_id
FROM windowed
WHERE purchases_in_7_days >= 3;`
      },
    ]
  },
];

const SQL_PREP_COLOR = "#38bdf8";

function SQLPrepMode() {
  const [view, setView] = useState("topics");
  const [activeTopic, setActiveTopic] = useState(null);
  const [stepIdx, setStepIdx] = useState(0);

  const openTopic = (topic) => {
    setActiveTopic(topic);
    setStepIdx(0);
    setView("lesson");
  };

  const currentStep = activeTopic ? activeTopic.steps[stepIdx] : null;
  const isLast = activeTopic ? stepIdx === activeTopic.steps.length - 1 : false;

  if (view === "topics") return (
    <div>
      <div style={{ fontFamily: mono, fontSize: 10, color: SQL_PREP_COLOR, letterSpacing: "0.12em", marginBottom: 6 }}>SQL INTERVIEW PREP</div>
      <div style={{ fontSize: 13, color: C.muted, marginBottom: 20, lineHeight: 1.6 }}>
        {SQL_LESSONS.length} topics. Each one walks you through the concept and shows worked examples. No grading.
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {SQL_LESSONS.map(t => (
          <button key={t.id} onClick={() => openTopic(t)} style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            background: C.card, border: "1.5px solid " + C.border, borderRadius: 10,
            padding: "14px 18px", cursor: "pointer", textAlign: "left", width: "100%",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontSize: 18 }}>{t.icon}</span>
              <div>
                <div style={{ fontSize: 13, color: C.text, fontWeight: 600, marginBottom: 3 }}>{t.label}</div>
                <div style={{ fontFamily: mono, fontSize: 10, color: C.muted, lineHeight: 1.5 }}>{t.summary}</div>
              </div>
            </div>
            <span style={{ fontFamily: mono, fontSize: 16, color: SQL_PREP_COLOR, flexShrink: 0, marginLeft: 12 }}>→</span>
          </button>
        ))}
      </div>
    </div>
  );

  if (view === "lesson" && activeTopic && currentStep) return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <button onClick={() => setView("topics")} style={{ background: "none", border: "none", fontFamily: mono, fontSize: 11, color: C.muted, cursor: "pointer" }}>← Topics</button>
        <div style={{ fontFamily: mono, fontSize: 11, color: C.muted }}>{stepIdx + 1} / {activeTopic.steps.length}</div>
      </div>

      <div style={{ height: 3, background: C.border, borderRadius: 2, marginBottom: 20 }}>
        <div style={{ height: "100%", width: ((stepIdx + 1) / activeTopic.steps.length * 100) + "%", background: SQL_PREP_COLOR, borderRadius: 2, transition: "width 0.3s" }} />
      </div>

      <div style={{ fontFamily: mono, fontSize: 9, color: SQL_PREP_COLOR, letterSpacing: "0.12em", marginBottom: 8 }}>{activeTopic.label.toUpperCase()}</div>
      <div style={{ fontSize: 17, fontWeight: 700, color: C.text, marginBottom: 16, lineHeight: 1.4 }}>{currentStep.title}</div>

      <div style={{ background: C.card, border: "1px solid " + C.border, borderRadius: 10, padding: "16px 18px", marginBottom: 14, fontSize: 13, color: C.muted, lineHeight: 1.8 }}>
        {currentStep.explanation}
      </div>

      <div style={{ background: "#0d1117", border: "1px solid " + SQL_PREP_COLOR + "33", borderRadius: 10, padding: "16px 18px", marginBottom: 20 }}>
        <div style={{ fontFamily: mono, fontSize: 9, color: SQL_PREP_COLOR, letterSpacing: "0.1em", marginBottom: 10 }}>EXAMPLE</div>
        <pre style={{ fontFamily: mono, fontSize: 12, color: "#c9d1d9", lineHeight: 1.7, margin: 0, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{currentStep.code}</pre>
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        {stepIdx > 0 && (
          <button onClick={() => setStepIdx(stepIdx - 1)} style={{
            flex: 1, padding: "10px", background: "transparent", color: C.muted,
            border: "1px solid " + C.border, borderRadius: 8, fontFamily: mono, fontSize: 12, cursor: "pointer",
          }}>← Previous</button>
        )}
        {!isLast ? (
          <button onClick={() => setStepIdx(stepIdx + 1)} style={{
            flex: 1, padding: "10px", background: SQL_PREP_COLOR, color: C.bg,
            border: "none", borderRadius: 8, fontFamily: mono, fontSize: 12, fontWeight: 700, cursor: "pointer",
          }}>Next →</button>
        ) : (
          <button onClick={() => setView("topics")} style={{
            flex: 1, padding: "10px", background: SQL_PREP_COLOR, color: C.bg,
            border: "none", borderRadius: 8, fontFamily: mono, fontSize: 12, fontWeight: 700, cursor: "pointer",
          }}>Done — Back to Topics</button>
        )}
      </div>
    </div>
  );

  return null;
}


// ── SUPABASE CONFIG ───────────────────────────────────────────────────────────

const SUPABASE_URL = "https://ieifyvmweywzplmwqtns.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImllaWZ5dm13ZXl3enBsbXdxdG5zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU1MDUzMjAsImV4cCI6MjA5MTA4MTMyMH0.eWdSzl1GzB4DNys1KbwoHKqdH56RYS04yanFLQ7PjNQ";

async function saveSessionToSupabase(sessionData) {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/analytics_sessions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": SUPABASE_ANON_KEY,
        "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
        "Prefer": "return=minimal",
      },
      body: JSON.stringify(sessionData),
    });
    return res.ok;
  } catch (e) {
    console.error("Supabase save error:", e);
    return false;
  }
}

async function loadSessionsFromSupabase() {
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/analytics_sessions?select=*&order=created_at.desc&limit=30`,
      {
        headers: {
          "apikey": SUPABASE_ANON_KEY,
          "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
        },
      }
    );
    if (!res.ok) return [];
    return await res.json();
  } catch (e) {
    return [];
  }
}

// ── ANALYTICS COACH ───────────────────────────────────────────────────────────

const COACH_ACCENT = "#e879f9";
const COACH_BG = "#1a0a1f";

const FOCUS_OPTIONS = [
  { value: "auto",         label: "Auto-calibrate (recommended)" },
  { value: "business",     label: "Business thinking focus" },
  { value: "sql",          label: "SQL technical focus" },
  { value: "stakeholder",  label: "Stakeholder simulation focus" },
  { value: "communication",label: "Communication focus" },
  { value: "interview",    label: "Mock interview mode" },
  { value: "linkedin",     label: "LinkedIn content creation" },
];

const FOCUS_INSTRUCTIONS = {
  auto:          "Run the full standard 4-module session with auto-calibrated difficulty.",
  business:      "Focus heavily on business thinking today. Spend 25 minutes on progressively harder business scenarios. Include a brief SQL warmup but skip the full stakeholder simulation.",
  sql:           "Focus heavily on SQL today. Spend 25 minutes on progressively harder SQL challenges including complex CTEs and window functions. Include a brief business warmup.",
  stakeholder:   "Focus on stakeholder simulation today. Run 3 different stakeholder scenarios back to back with different executive personalities.",
  communication: "Focus on communication today. Cover executive emails, slide headlines, board memos, and one-page briefs using the SCR framework.",
  interview:     "Run a full mock analytics interview. Ask typical senior analytics interview questions across business thinking, SQL, and communication competencies. Give hiring-manager-level feedback after each answer. Be direct and challenging.",
  linkedin:      "Help Jake create a LinkedIn post about his analytics learning journey. Ask clarifying questions about tone, focus, and key skills to highlight. Remember: absolutely no em-dashes or hyphens anywhere in the final post.",
};

const COACH_SYSTEM = `You are an expert AI Analytics Training Partner conducting a structured daily practice session for Jake.

Jake's current skill levels (out of 10):
- Business Thinking: 9.5 — Advanced. Identify missing data, build measurement frameworks, handle conflicting data
- SQL Technical: 9.4 — Advanced. Complex multi-CTEs, window functions (RANK, LAG, ROW_NUMBER), CASE statements, conditional aggregations
- Stakeholder Communication: 9.0 — Advanced. Board-level presentations, hostile executives, panel simulations, coaching junior analysts
- Executive Communication: 8.5 — Advanced. Board memos, SCR framework, one-page briefs, slide headlines

Key facts about Jake:
- 7+ structured training sessions completed
- Core principle: "Locate before you hypothesize" — always identify WHERE in customer journey a problem occurs first
- Natural strength: stakeholder communication, making adversarial stakeholders feel like collaborators
- Writing preference: NO em-dashes or hyphens in any written deliverables
- SQL mastered: SELECT, GROUP BY, JOINs, LEFT JOINs, CTEs, window functions, CASE statements, conditional aggregations

Session rules:
- Push hard — Jake is advanced, do not simplify or over-scaffold
- Give scored feedback (X/10) after each answer with specific actionable coaching
- Build progressively within each module
- If Jake says something is too hard, scaffold ONE level then push again immediately
- Never give away the full answer before Jake attempts it
- End session with full scorecard and 3 key takeaways
- At the very end of the session output scores on separate lines EXACTLY like this (no other text on these lines):
  SCORE_BT:X.X
  SCORE_SQL:X.X
  SCORE_SH:X.X
  SCORE_COM:X.X
  (only include modules actually covered in the session)

Start with a brief warm greeting, today's difficulty calibration, then immediately begin with a warmup question. Keep responses concise and direct.`;

function AnalyticsCoach({ apiKey }) {
  const [phase, setPhase] = useState("home");
  const [focus, setFocus] = useState("auto");
  const [msgs, setMsgs] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [inputMode, setInputMode] = useState("text");
  const [showTables, setShowTables] = useState(false);
  const [sessionTables, setSessionTables] = useState([]);
  const [scores, setScores] = useState(() => {
    const saved = localStorage.getItem("coach_scores");
    return saved ? JSON.parse(saved) : { bt: 9.5, sql: 9.4, sh: 9.0, com: 8.5 };
  });
  const [sessionCount, setSessionCount] = useState(() => parseInt(localStorage.getItem("coach_sessions") || "7"));
  const [streak, setStreak] = useState(() => parseInt(localStorage.getItem("coach_streak") || "7"));
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [newScores, setNewScores] = useState({});
  const [savingToDb, setSavingToDb] = useState(false);
  const [dbSaved, setDbSaved] = useState(false);
  const msgsEndRef = useRef(null);

  useEffect(() => {
    if (msgsEndRef.current) msgsEndRef.current.scrollIntoView({ behavior: "smooth" });
  }, [msgs, loading]);

  const saveScoresLocally = (s, count, str) => {
    localStorage.setItem("coach_scores", JSON.stringify(s));
    localStorage.setItem("coach_sessions", String(count));
    localStorage.setItem("coach_streak", String(str));
  };

  const overall = ((scores.bt + scores.sql + scores.sh + scores.com) / 4).toFixed(1);

  const callClaude = async (messages) => {
    if (!apiKey) { setError("Add your Anthropic API key above to use Analytics Coach."); return null; }
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "anthropic-dangerous-direct-browser-access": "true",
      },
      body: JSON.stringify({
        model: "claude-opus-4-5",
        max_tokens: 1000,
        system: COACH_SYSTEM,
        messages,
      }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || `API error ${res.status}`);
    }
    const data = await res.json();
    return data.content?.[0]?.text || "";
  };

  const parseScores = (text) => {
    const found = {};
    const pat = /SCORE_(BT|SQL|SH|COM):([\d.]+)/g;
    let m;
    while ((m = pat.exec(text)) !== null) {
      found[m[1].toLowerCase()] = parseFloat(m[2]);
    }
    return found;
  };

  const detectTables = (text) => {
    const tables = [];
    // Match patterns like: table_name (col1, col2, col3) or table_name: col1 | col2
    const blockPattern = /```[\s\S]*?```/g;
    const blocks = text.match(blockPattern) || [];
    blocks.forEach(block => {
      const lines = block.replace(/```/g, "").trim().split("\n");
      lines.forEach(line => {
        const tableMatch = line.match(/^(\w+)\s*[|:]\s*(.+)/);
        if (tableMatch) {
          const name = tableMatch[1].trim();
          const cols = tableMatch[2].split(/[|,]/).map(c => c.trim()).filter(Boolean);
          if (cols.length > 0 && !["SELECT", "FROM", "WHERE", "JOIN", "WITH"].includes(name.toUpperCase())) {
            tables.push({ name, cols });
          }
        }
      });
    });
    // Also match inline patterns like "table called orders with columns: order_id, customer_id, revenue"
    const inlinePattern = /(?:table\s+(?:called\s+)?|`?)(\w+)`?\s+(?:with\s+columns?:|columns?:|\()\s*([\w,\s]+)/gi;
    let m2;
    while ((m2 = inlinePattern.exec(text)) !== null) {
      const name = m2[1].trim();
      const cols = m2[2].split(",").map(c => c.trim()).filter(Boolean);
      if (cols.length > 0) tables.push({ name, cols });
    }
    if (tables.length > 0) {
      setSessionTables(prev => {
        const existing = prev.map(t => t.name);
        const newTables = tables.filter(t => !existing.includes(t.name));
        return newTables.length > 0 ? [...prev, ...newTables] : prev;
      });
    }
  };

  const startSession = async () => {
    setError("");
    setMsgs([]);
    setNewScores({});
    setDbSaved(false);
    setSessionTables([]);
    setInputMode("text");
    setShowTables(false);
    setPhase("session");
    const initMsg = { role: "user", content: "Start my session now. " + (FOCUS_INSTRUCTIONS[focus] || FOCUS_INSTRUCTIONS.auto) };
    const conversation = [initMsg];
    setLoading(true);
    try {
      const reply = await callClaude(conversation);
      const clean = reply.replace(/SCORE_(BT|SQL|SH|COM):[\d.]+/g, "").trim();
      const found = parseScores(reply);
      setMsgs([{ role: "assistant", content: clean }]);
      detectTables(clean);
      if (Object.keys(found).length > 0) setNewScores(found);
    } catch (e) {
      setError(e.message);
      setPhase("home");
    }
    setLoading(false);
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg = { role: "user", content: input.trim() };
    setInput("");
    const history = [...msgs, { role: "user", content: userMsg.content }];
    setMsgs(history);
    setLoading(true);
    setError("");

    const apiMsgs = [
      { role: "user", content: "Start my session now. " + (FOCUS_INSTRUCTIONS[focus] || FOCUS_INSTRUCTIONS.auto) },
      ...msgs.map(m => ({ role: m.role, content: m.content })),
      userMsg,
    ];

    try {
      const reply = await callClaude(apiMsgs);
      const clean = reply.replace(/SCORE_(BT|SQL|SH|COM):[\d.]+/g, "").trim();
      const found = parseScores(reply);
      setMsgs(prev => [...prev, { role: "assistant", content: clean }]);
      detectTables(clean);
      if (Object.keys(found).length > 0) {
        setNewScores(found);
        setTimeout(() => finishSession(found), 800);
      }
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  };

  const finishSession = async (ns) => {
    const finalScores = { ...scores, ...ns };
    const newCount = sessionCount + 1;
    const today = new Date().toDateString();
    const lastDate = localStorage.getItem("coach_last_date");
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    const newStreak = lastDate === yesterday ? streak + 1 : lastDate === today ? streak : 1;
    localStorage.setItem("coach_last_date", today);
    setScores(finalScores);
    setSessionCount(newCount);
    setStreak(newStreak);
    saveScoresLocally(finalScores, newCount, newStreak);

    setSavingToDb(true);
    const saved = await saveSessionToSupabase({
      session_number: newCount,
      score_bt: finalScores.bt,
      score_sql: finalScores.sql,
      score_sh: finalScores.sh,
      score_com: finalScores.com,
      overall_score: parseFloat(((finalScores.bt + finalScores.sql + finalScores.sh + finalScores.com) / 4).toFixed(1)),
      streak: newStreak,
    });
    setSavingToDb(false);
    setDbSaved(saved);
  };

  const endSessionManually = async () => {
    if (Object.keys(newScores).length > 0) {
      await finishSession(newScores);
      setPhase("results");
      return;
    }
    const apiMsgs = [
      { role: "user", content: "Start my session now. " + (FOCUS_INSTRUCTIONS[focus] || FOCUS_INSTRUCTIONS.auto) },
      ...msgs.map(m => ({ role: m.role, content: m.content })),
      { role: "user", content: "Please end the session now. Output my scores using SCORE_BT, SCORE_SQL, SCORE_SH, SCORE_COM format, then give a brief summary." },
    ];
    setLoading(true);
    try {
      const reply = await callClaude(apiMsgs);
      const found = parseScores(reply);
      const clean = reply.replace(/SCORE_(BT|SQL|SH|COM):[\d.]+/g, "").trim();
      setMsgs(prev => [...prev, { role: "assistant", content: clean }]);
      if (Object.keys(found).length > 0) {
        await finishSession(found);
        setNewScores(found);
      }
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
    setPhase("results");
  };

  const loadHistory = async () => {
    setHistoryLoading(true);
    const data = await loadSessionsFromSupabase();
    setHistory(data);
    setHistoryLoading(false);
    setShowHistory(true);
  };

  const scoreColor = (v) => v >= 9 ? C.ok : v >= 7.5 ? COACH_ACCENT : v >= 6 ? C.warn : C.err;
  const scoreBarColor = (k) => ({ bt: "#1D9E75", sql: "#378ADD", sh: "#7F77DD", com: "#D85A30" }[k]);
  const scoreName = (k) => ({ bt: "Business thinking", sql: "SQL technical", sh: "Stakeholder", com: "Communication" }[k]);

  // HOME
  if (phase === "home") return (
    <div>
      {/* Score dashboard */}
      <div style={{ background: COACH_BG, border: `1.5px solid ${COACH_ACCENT}22`, borderRadius: 12, padding: "18px 20px", marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div style={{ fontFamily: mono, fontSize: 10, color: COACH_ACCENT, letterSpacing: "0.12em" }}>ANALYTICS COACH — PROGRESS</div>
          <div style={{ display: "flex", gap: 20 }}>
            {[["Sessions", sessionCount], ["Streak", streak + "d"], ["Overall", overall]].map(([l, v]) => (
              <div key={l} style={{ textAlign: "center" }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: COACH_ACCENT }}>{v}</div>
                <div style={{ fontFamily: mono, fontSize: 9, color: C.muted }}>{l.toUpperCase()}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
          {Object.entries(scores).map(([k, v]) => (
            <div key={k} style={{ background: C.card, borderRadius: 8, padding: "10px 12px" }}>
              <div style={{ fontFamily: mono, fontSize: 9, color: C.muted, marginBottom: 5 }}>{scoreName(k).toUpperCase()}</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: scoreColor(v) }}>{v.toFixed(1)}</div>
              <div style={{ height: 3, background: C.border, borderRadius: 2, marginTop: 6 }}>
                <div style={{ height: "100%", width: `${v * 10}%`, background: scoreBarColor(k), borderRadius: 2, transition: "width 0.5s" }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Focus selector */}
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: "16px 18px", marginBottom: 14 }}>
        <div style={{ fontFamily: mono, fontSize: 10, color: C.muted, letterSpacing: "0.12em", marginBottom: 10 }}>SESSION FOCUS</div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
          {FOCUS_OPTIONS.map(o => (
            <button key={o.value} onClick={() => setFocus(o.value)} style={{
              padding: "6px 12px", borderRadius: 6,
              background: focus === o.value ? COACH_ACCENT : "transparent",
              color: focus === o.value ? C.bg : C.muted,
              border: `1.5px solid ${focus === o.value ? COACH_ACCENT : C.border}`,
              fontFamily: mono, fontSize: 10, fontWeight: 600, cursor: "pointer",
            }}>{o.label}</button>
          ))}
        </div>
        {error && <div style={{ padding: "8px 12px", background: C.err + "15", border: `1px solid ${C.err}44`, borderRadius: 6, fontFamily: mono, fontSize: 11, color: C.err, marginBottom: 12 }}>{error}</div>}
        <button onClick={startSession} disabled={!apiKey} style={{
          width: "100%", padding: "11px", background: apiKey ? COACH_ACCENT : C.border,
          color: C.bg, border: "none", borderRadius: 7,
          fontFamily: mono, fontSize: 13, fontWeight: 700,
          cursor: apiKey ? "pointer" : "not-allowed", letterSpacing: "0.04em",
        }}>{apiKey ? "◈ START TODAY'S SESSION" : "ADD API KEY TO START"}</button>
      </div>

      {/* History toggle */}
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button onClick={showHistory ? () => setShowHistory(false) : loadHistory} style={{
          background: "transparent", border: `1px solid ${C.border}`, borderRadius: 6,
          padding: "6px 14px", fontFamily: mono, fontSize: 10, color: C.muted, cursor: "pointer",
        }}>{showHistory ? "hide history" : "view session history"}</button>
      </div>

      {showHistory && (
        <div style={{ marginTop: 12, background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, overflow: "hidden" }}>
          <div style={{ padding: "10px 16px", borderBottom: `1px solid ${C.border}`, fontFamily: mono, fontSize: 10, color: C.muted, letterSpacing: "0.1em" }}>SESSION HISTORY</div>
          {historyLoading ? (
            <div style={{ padding: 20, textAlign: "center", fontFamily: mono, fontSize: 12, color: C.muted }}>Loading...</div>
          ) : history.length === 0 ? (
            <div style={{ padding: 20, textAlign: "center", fontFamily: mono, fontSize: 12, color: C.muted }}>No sessions saved yet.</div>
          ) : (
            <div style={{ maxHeight: 280, overflowY: "auto" }}>
              {history.map((s, i) => (
                <div key={s.id} style={{ display: "flex", alignItems: "center", padding: "10px 16px", borderBottom: `1px solid ${C.border}`, gap: 14 }}>
                  <div style={{ fontFamily: mono, fontSize: 11, color: C.muted, minWidth: 24 }}>#{s.session_number}</div>
                  <div style={{ fontFamily: mono, fontSize: 10, color: C.muted, minWidth: 80 }}>{new Date(s.created_at).toLocaleDateString()}</div>
                  <div style={{ display: "flex", gap: 10, flex: 1 }}>
                    {[["BT", s.score_bt, "#1D9E75"], ["SQL", s.score_sql, "#378ADD"], ["SH", s.score_sh, "#7F77DD"], ["COM", s.score_com, "#D85A30"]].map(([l, v, col]) => (
                      <div key={l} style={{ textAlign: "center" }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: col }}>{v?.toFixed(1)}</div>
                        <div style={{ fontFamily: mono, fontSize: 8, color: C.muted }}>{l}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ fontFamily: mono, fontSize: 12, fontWeight: 700, color: COACH_ACCENT }}>{s.overall_score?.toFixed(1)}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );

  // SESSION
  if (phase === "session") return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <div style={{ fontFamily: mono, fontSize: 10, color: COACH_ACCENT, letterSpacing: "0.12em" }}>SESSION IN PROGRESS</div>
        <button onClick={endSessionManually} disabled={loading} style={{
          background: "transparent", border: `1px solid ${C.border}`, borderRadius: 6,
          padding: "5px 12px", fontFamily: mono, fontSize: 10, color: C.muted, cursor: "pointer",
        }}>end session</button>
      </div>

      {/* Chat messages */}
      <div style={{ background: COACH_BG, border: `1.5px solid ${COACH_ACCENT}22`, borderRadius: 12, marginBottom: 12, overflow: "hidden" }}>
        <div style={{ maxHeight: 480, overflowY: "auto", padding: "14px 16px", display: "flex", flexDirection: "column", gap: 12 }}>
          {msgs.map((m, i) => (
            <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: m.role === "user" ? "flex-end" : "flex-start" }}>
              <div style={{ fontFamily: mono, fontSize: 9, color: C.muted, marginBottom: 3, padding: "0 2px" }}>{m.role === "assistant" ? "TRAINER" : "YOU"}</div>
              <div style={{
                maxWidth: "88%", padding: "10px 14px", borderRadius: 10,
                background: m.role === "user" ? COACH_ACCENT + "20" : C.card,
                border: `1px solid ${m.role === "user" ? COACH_ACCENT + "44" : C.border}`,
                fontSize: 13, lineHeight: 1.7, color: C.text,
                borderBottomRightRadius: m.role === "user" ? 3 : 10,
                borderBottomLeftRadius: m.role === "assistant" ? 3 : 10,
                whiteSpace: "pre-wrap",
              }}>{m.content}</div>
            </div>
          ))}
          {loading && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
              <div style={{ fontFamily: mono, fontSize: 9, color: C.muted, marginBottom: 3 }}>TRAINER</div>
              <div style={{ padding: "10px 14px", background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, borderBottomLeftRadius: 3, display: "flex", gap: 5, alignItems: "center" }}>
                {[0, 0.2, 0.4].map((d, i) => (
                  <div key={i} style={{ width: 5, height: 5, borderRadius: "50%", background: COACH_ACCENT, animation: "coachBounce 1.2s infinite", animationDelay: `${d}s`, opacity: 0.7 }} />
                ))}
              </div>
            </div>
          )}
          <div ref={msgsEndRef} />
        </div>

        {/* Input mode toggle + input */}
        <div style={{ borderTop: `1px solid ${C.border}`, padding: "10px 12px" }}>
          <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
            {["text", "sql"].map(m => (
              <button key={m} onClick={() => setInputMode(m)} style={{
                padding: "3px 10px", borderRadius: 4, fontFamily: mono, fontSize: 10, fontWeight: 700,
                background: inputMode === m ? (m === "sql" ? "#4fc3f7" : COACH_ACCENT) : "transparent",
                color: inputMode === m ? C.bg : C.muted,
                border: `1px solid ${inputMode === m ? (m === "sql" ? "#4fc3f7" : COACH_ACCENT) : C.border}`,
                cursor: "pointer",
              }}>{m === "sql" ? "⬡ SQL" : "✎ Text"}</button>
            ))}
            {inputMode === "sql" && (
              <button onClick={() => setShowTables(s => !s)} style={{
                marginLeft: "auto", padding: "3px 10px", borderRadius: 4,
                fontFamily: mono, fontSize: 10, fontWeight: 700,
                background: showTables ? "#378ADD22" : "transparent",
                color: showTables ? "#378ADD" : C.muted,
                border: `1px solid ${showTables ? "#378ADD" : C.border}`,
                cursor: "pointer",
              }}>⊞ {showTables ? "hide tables" : "show tables"}</button>
            )}
          </div>

          {/* Table reference panel */}
          {inputMode === "sql" && showTables && (
            <div style={{ background: "#040810", border: `1px solid #378ADD33`, borderRadius: 7, padding: "10px 12px", marginBottom: 8, fontFamily: mono, fontSize: 11, color: "#378ADD", lineHeight: 1.8, overflowX: "auto" }}>
              <div style={{ fontSize: 9, letterSpacing: "0.12em", color: C.muted, marginBottom: 6 }}>SESSION TABLES</div>
              {sessionTables.length === 0 ? (
                <div style={{ color: C.muted, fontSize: 11 }}>No tables detected yet — tables will appear here when the trainer introduces them.</div>
              ) : (
                sessionTables.map((t, i) => (
                  <div key={i} style={{ marginBottom: 8 }}>
                    <span style={{ color: "#4fc3f7", fontWeight: 700 }}>{t.name}</span>
                    <span style={{ color: C.muted }}> ({t.cols.join(", ")})</span>
                  </div>
                ))
              )}
            </div>
          )}

          <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && e.ctrlKey && sendMessage()}
              placeholder={inputMode === "sql" ? "Write your SQL here... (Ctrl+Enter to send)" : "Type your answer... (Ctrl+Enter to send)"}
              disabled={loading}
              rows={inputMode === "sql" ? 6 : 3}
              style={{
                flex: 1, background: "#09090f",
                border: `1.5px solid ${inputMode === "sql" ? "#4fc3f722" : C.border}`,
                borderRadius: 7, padding: "9px 13px",
                color: C.text,
                fontFamily: inputMode === "sql" ? mono : sans,
                fontSize: 13, outline: "none", resize: "vertical", lineHeight: 1.6,
              }}
              onFocus={e => e.target.style.borderColor = inputMode === "sql" ? "#4fc3f7" : COACH_ACCENT}
              onBlur={e => e.target.style.borderColor = inputMode === "sql" ? "#4fc3f722" : C.border}
            />
            <button onClick={sendMessage} disabled={loading || !input.trim()} style={{
              padding: "9px 18px", background: COACH_ACCENT, color: C.bg,
              border: "none", borderRadius: 7, fontFamily: mono, fontSize: 12, fontWeight: 700,
              cursor: loading || !input.trim() ? "not-allowed" : "pointer",
              opacity: loading || !input.trim() ? 0.4 : 1, alignSelf: "flex-end",
            }}>Send</button>
          </div>
        </div>
      </div>

      {error && <div style={{ padding: "8px 12px", background: C.err + "15", border: `1px solid ${C.err}44`, borderRadius: 6, fontFamily: mono, fontSize: 11, color: C.err, marginBottom: 10 }}>{error}</div>}
      <style>{`@keyframes coachBounce { 0%,80%,100%{transform:translateY(0);opacity:0.4} 40%{transform:translateY(-5px);opacity:1} }`}</style>
    </div>
  );

  // RESULTS
  if (phase === "results") {
    const names = { bt: "Business thinking", sql: "SQL technical", sh: "Stakeholder", com: "Communication" };
    const colors = { bt: "#1D9E75", sql: "#378ADD", sh: "#7F77DD", com: "#D85A30" };
    return (
      <div>
        <div style={{ background: COACH_BG, border: `1.5px solid ${COACH_ACCENT}33`, borderRadius: 12, padding: "20px", marginBottom: 16 }}>
          <div style={{ fontFamily: mono, fontSize: 10, color: COACH_ACCENT, letterSpacing: "0.12em", marginBottom: 16 }}>SESSION {sessionCount} COMPLETE</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 16 }}>
            {Object.entries(scores).map(([k, v]) => {
              const prev = v - (newScores[k] ? newScores[k] - v : 0);
              const delta = newScores[k] ? (newScores[k] - (v - (newScores[k] - v))).toFixed(1) : null;
              return (
                <div key={k} style={{ background: C.card, borderRadius: 8, padding: "12px", textAlign: "center" }}>
                  <div style={{ fontFamily: mono, fontSize: 8, color: C.muted, marginBottom: 6 }}>{names[k].toUpperCase()}</div>
                  <div style={{ fontSize: 22, fontWeight: 700, color: colors[k] }}>{v.toFixed(1)}</div>
                  {newScores[k] !== undefined && (
                    <div style={{ fontFamily: mono, fontSize: 10, color: parseFloat(newScores[k]) >= (v - (newScores[k] - v)) ? C.ok : C.err, marginTop: 3 }}>
                      {parseFloat(newScores[k]) >= (v - (newScores[k] - v)) ? "+" : ""}{(newScores[k] - (v - (newScores[k] - v))).toFixed(1)}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontFamily: mono, fontSize: 11, color: savingToDb ? C.warn : dbSaved ? C.ok : C.muted }}>
              {savingToDb ? "Saving to Supabase..." : dbSaved ? "Saved to Supabase" : ""}
            </div>
            <div style={{ fontFamily: mono, fontSize: 11, color: C.muted }}>Streak: {streak} days</div>
          </div>
        </div>
        <button onClick={() => { setPhase("home"); setNewScores({}); setMsgs([]); setDbSaved(false); }} style={{
          width: "100%", padding: "11px", background: "transparent",
          border: `1.5px solid ${COACH_ACCENT}`, color: COACH_ACCENT,
          borderRadius: 7, fontFamily: mono, fontSize: 12, fontWeight: 700, cursor: "pointer",
        }}>← BACK TO DASHBOARD</button>
      </div>
    );
  }

  return null;
}

// ── API KEY BANNER ────────────────────────────────────────────────────────────

function ApiKeyBanner({ apiKey, onSet }) {
  const [draft, setDraft] = useState("");
  const [show, setShow] = useState(false);

  if (apiKey) return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 16px", background: C.ok + "10", border: `1px solid ${C.ok}33`, borderRadius: 8, marginBottom: 20 }}>
      <div style={{ width: 8, height: 8, borderRadius: "50%", background: C.ok, boxShadow: `0 0 6px ${C.ok}` }} />
      <span style={{ fontFamily: mono, fontSize: 11, color: C.ok }}>AI Checker Active</span>
      <button onClick={() => onSet("")} style={{ marginLeft: "auto", background: "transparent", border: "none", color: C.muted, fontFamily: mono, fontSize: 11, cursor: "pointer" }}>× Remove key</button>
    </div>
  );

  return (
    <div style={{ padding: "16px 18px", background: C.warn + "0c", border: `1.5px solid ${C.warn}44`, borderRadius: 10, marginBottom: 20 }}>
      <div style={{ fontFamily: mono, fontSize: 11, color: C.warn, marginBottom: 10 }}>⚠ Add your Anthropic API key to enable AI answer checking</div>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <input type={show ? "text" : "password"} value={draft} onChange={e => setDraft(e.target.value)}
          placeholder="sk-ant-..." onKeyDown={e => e.key === "Enter" && draft.trim() && onSet(draft.trim())}
          style={{ flex: 1, background: "#09090f", border: `1.5px solid ${C.border}`, borderRadius: 6, padding: "8px 12px", color: C.text, fontFamily: mono, fontSize: 12, outline: "none" }}
          onFocus={e => e.target.style.borderColor = C.warn}
          onBlur={e => e.target.style.borderColor = C.border}
        />
        <button onClick={() => setShow(s => !s)} style={{ background: "transparent", border: `1px solid ${C.border}`, borderRadius: 6, padding: "8px 10px", color: C.muted, fontFamily: mono, fontSize: 11, cursor: "pointer" }}>{show ? "hide" : "show"}</button>
        <Btn onClick={() => draft.trim() && onSet(draft.trim())} disabled={!draft.trim()} color={C.warn}>Activate</Btn>
      </div>
      <div style={{ fontFamily: mono, fontSize: 10, color: C.muted, marginTop: 8 }}>Key stays in memory only. Get yours at console.anthropic.com</div>
    </div>
  );
}

// ── APP SHELL ─────────────────────────────────────────────────────────────────

// ── KPI LIBRARY DATA ─────────────────────────────────────────────────────────
// 90 cards across 5 domains: Retail/E-commerce, Healthcare, Finance,
// Operations/Supply Chain, Marketing
// Each card: { metric, formula, why, decision, misinterpretations, roles }

const KPI_LIBRARY = {
  retail: [
    {
      metric: "Conversion Rate",
      formula: "(Orders / Sessions) × 100",
      why: "Measures the percentage of visitors who complete a purchase. The single most direct indicator of how well your site turns traffic into revenue.",
      decision: "Pull this when leadership asks why revenue is flat despite healthy traffic growth — it tells you whether the problem is acquisition or the purchase experience itself.",
      misinterpretations: ["Don't compare conversion rates across channels in isolation — mobile converts lower than desktop by nature, so blended rate without segmentation misleads.", "A rising conversion rate on falling traffic can mean you're losing top-of-funnel reach while retaining only high-intent visitors."],
      roles: ["E-commerce Analyst", "Digital Analyst", "Growth Analyst"],
    },
    {
      metric: "Average Order Value (AOV)",
      formula: "Total Revenue / Number of Orders",
      why: "Measures how much customers spend per transaction. Increasing AOV grows revenue without acquiring new customers.",
      decision: "Pull this when evaluating bundling strategies, upsell prompts, or free-shipping thresholds — it quantifies whether those levers are moving the needle.",
      misinterpretations: ["AOV can be inflated by a few high-value outlier orders — always check the median alongside the mean.", "A rising AOV with falling order volume may actually mean fewer customers are buying, not that the strategy is working."],
      roles: ["E-commerce Analyst", "Retail Analyst", "Merchandising Analyst"],
    },
    {
      metric: "Customer Lifetime Value (LTV or CLV)",
      formula: "AOV × Purchase Frequency × Customer Lifespan",
      why: "Estimates the total revenue a customer generates over their relationship with the brand. The foundational metric for any retention strategy.",
      decision: "Pull this when deciding how much to spend on acquisition — LTV sets the ceiling on sustainable CAC. Also critical when evaluating loyalty programs.",
      misinterpretations: ["LTV is a prediction, not a fact — it assumes historical behavior continues, which breaks down during market disruptions.", "Simple LTV formulas ignore margin — you need gross-margin-adjusted LTV to know if customers are actually profitable."],
      roles: ["E-commerce Analyst", "Customer Analytics Manager", "Growth Analyst"],
    },
    {
      metric: "Customer Acquisition Cost (CAC)",
      formula: "Total Marketing + Sales Spend / New Customers Acquired",
      why: "Measures the total cost to acquire one new customer. The counterpart to LTV — together they determine business viability.",
      decision: "Pull this when the CFO asks whether the marketing budget is efficient, or when evaluating whether to scale a specific channel.",
      misinterpretations: ["CAC without a time boundary is meaningless — it must be calculated over a specific period.", "Blended CAC hides channel-specific inefficiency — always break down by acquisition channel."],
      roles: ["Growth Analyst", "Marketing Analyst", "E-commerce Analyst"],
    },
    {
      metric: "Cart Abandonment Rate",
      formula: "(1 − (Completed Purchases / Carts Created)) × 100",
      why: "Measures the percentage of shoppers who add items to cart but don't complete purchase. A high rate signals friction in the checkout experience.",
      decision: "Pull this when conversion rate drops and you need to isolate where in the funnel the problem is — abandonment pinpoints the checkout specifically.",
      misinterpretations: ["Industry average cart abandonment is ~70% — a 68% rate isn't necessarily a problem unless it's trending up or your category benchmark is lower.", "Some abandonment is natural browse behavior — focus on recovery rate (email/retargeting recapture) alongside the raw rate."],
      roles: ["E-commerce Analyst", "CRO Analyst", "Digital Analyst"],
    },
    {
      metric: "Return Rate",
      formula: "(Units Returned / Units Sold) × 100",
      why: "Measures product return frequency. High return rates destroy margin and signal product-expectation mismatch.",
      decision: "Pull this when gross margin is declining unexpectedly or when evaluating a new product category's performance. Also a leading signal of customer dissatisfaction before review scores accumulate.",
      misinterpretations: ["A low return rate in a category where returns should be expected (apparel, footwear) may mean customers are keeping bad products out of friction — not satisfaction.", "Return rate by channel differs significantly — marketplace returns often run higher than DTC."],
      roles: ["Retail Analyst", "Merchandising Analyst", "E-commerce Analyst"],
    },
    {
      metric: "Revenue per Visitor (RPV)",
      formula: "Total Revenue / Total Sessions",
      why: "Combines conversion rate and AOV into a single metric. The most complete view of how efficiently traffic is being monetized.",
      decision: "Pull this when you need a single number to compare the monetization efficiency of different traffic sources or time periods — it collapses the conversion + AOV equation.",
      misinterpretations: ["RPV can be high for the wrong reasons — a small number of very high-value orders on low traffic inflates it without reflecting sustainable performance.", "Don't benchmark RPV across industries; it varies enormously by category and price point."],
      roles: ["E-commerce Analyst", "Digital Analyst", "Merchandising Analyst"],
    },
    {
      metric: "Gross Margin %",
      formula: "((Revenue − COGS) / Revenue) × 100",
      why: "Measures profitability before operating expenses. The foundational health metric — without positive gross margin, scaling revenue makes losses bigger.",
      decision: "Pull this when evaluating pricing decisions, promotional discounts, or new product lines — any revenue decision without gross margin context is incomplete.",
      misinterpretations: ["Gross margin doesn't include fulfillment, shipping, or returns — in e-commerce those costs can be large enough to make positive gross margin businesses cash-flow negative.", "Margin benchmarks vary enormously by category — compare within category, not against generic retail averages."],
      roles: ["Retail Analyst", "Finance Analyst", "E-commerce Analyst"],
    },
    {
      metric: "Repeat Purchase Rate",
      formula: "(Customers Who Bought More Than Once / Total Customers) × 100",
      why: "Measures customer loyalty and retention. Repeat customers cost less to serve and have higher LTV than new customers.",
      decision: "Pull this when evaluating loyalty programs, email retention campaigns, or subscription offerings — it's the outcome metric for every retention initiative.",
      misinterpretations: ["Repeat purchase rate measured over too short a window understates true loyalty — a 90-day window may miss customers who buy quarterly.", "A rising repeat rate on a shrinking customer base can mean churn is actually worse than it looks."],
      roles: ["E-commerce Analyst", "Customer Retention Analyst", "CRM Analyst"],
    },
    {
      metric: "Inventory Turnover",
      formula: "COGS / Average Inventory Value",
      why: "Measures how quickly inventory sells through. Low turnover ties up cash; high turnover signals strong demand or potential stockout risk.",
      decision: "Pull this when merchandising decisions are being made about which products to carry, discontinue, or reorder — it shows which SKUs are moving and which are dead weight.",
      misinterpretations: ["High turnover can be a stockout problem, not just strong sales — always pair with out-of-stock rate.", "Turnover benchmarks vary significantly by category; fresh food turns daily, furniture may turn twice a year."],
      roles: ["Retail Analyst", "Supply Chain Analyst", "Merchandising Analyst"],
    },
    {
      metric: "Net Promoter Score (NPS)",
      formula: "% Promoters (9-10) − % Detractors (0-6)",
      why: "Measures customer satisfaction and likelihood to recommend. A leading indicator of organic growth and brand health.",
      decision: "Pull this when evaluating whether a product, service change, or experience improvement actually moved customer sentiment — it's the outcome metric for CX initiatives.",
      misinterpretations: ["NPS is a survey metric — response bias is significant. Non-respondents are often detractors.", "NPS varies dramatically by industry — a score of +30 is excellent in retail but mediocre in B2B SaaS. Always benchmark within your category."],
      roles: ["CX Analyst", "Retail Analyst", "E-commerce Analyst"],
    },
    {
      metric: "Sell-Through Rate",
      formula: "(Units Sold / Units Received) × 100",
      why: "Measures how much of a received inventory shipment actually sold. The core merchandising efficiency metric.",
      decision: "Pull this when evaluating whether to reorder or markdown a product — a low sell-through on new arrivals is an early signal to promote before it becomes clearance.",
      misinterpretations: ["Sell-through rate is time-dependent — a 40% rate in the first week of a seasonal product may be excellent; 40% at end of season signals a problem.", "Sell-through ignores margin — a high-sell-through product at a loss is worse than a low-sell-through product with strong margin."],
      roles: ["Merchandising Analyst", "Retail Analyst", "Buying Analyst"],
    },
    {
      metric: "Bounce Rate",
      formula: "(Single-Page Sessions / Total Sessions) × 100",
      why: "Measures the percentage of visitors who leave after viewing only one page. High bounce rate can signal poor landing page relevance, slow load times, or audience mismatch.",
      decision: "Pull this when diagnosing why a paid traffic campaign is generating clicks but not conversions — it tells you whether traffic is landing on the wrong page or the page itself is the problem.",
      misinterpretations: ["A high bounce rate on a blog post or contact page may be perfectly normal — context matters.", "GA4 changed the definition of bounce rate — it now measures 'not engaged' sessions, which is stricter than the old single-page definition. Don't compare GA4 and UA bounce rates directly."],
      roles: ["Digital Analyst", "E-commerce Analyst", "SEO Analyst"],
    },
    {
      metric: "Customer Churn Rate",
      formula: "(Customers Lost in Period / Customers at Start of Period) × 100",
      why: "Measures the percentage of customers who stop buying over a period. In subscription and loyalty contexts, churn directly predicts revenue trajectory.",
      decision: "Pull this when LTV models need recalibrating or when the retention team needs to justify their budget — churn is the denominator in every LTV calculation.",
      misinterpretations: ["Churn rate definition varies — always clarify whether it's calculated on revenue or customer count, and whether it's voluntary or total churn.", "In DTC, churn is often calculated differently than in SaaS — a customer who doesn't buy in 12 months may not be 'churned' depending on the category."],
      roles: ["E-commerce Analyst", "Retention Analyst", "Subscription Analyst"],
    },
    {
      metric: "Cost per Acquisition (CPA) by Channel",
      formula: "Channel Ad Spend / New Customers Acquired via That Channel",
      why: "Breaks CAC down by marketing channel to show which acquisition sources are most efficient. The operational tool for budget allocation.",
      decision: "Pull this when the media buyer asks where to shift budget — it tells you which channels are acquiring customers at a profitable cost and which are burning money.",
      misinterpretations: ["Last-click attribution understates the contribution of upper-funnel channels like display or social awareness — always note your attribution model.", "CPA by channel ignores the quality of acquired customers — a cheap channel that brings low-LTV customers may be worse than an expensive channel with high-LTV customers."],
      roles: ["Marketing Analyst", "Growth Analyst", "E-commerce Analyst"],
    },
    {
      metric: "Days of Inventory on Hand",
      formula: "(Average Inventory / COGS) × Days in Period",
      why: "Estimates how many days of sales current inventory can support. Critical for cash flow planning and avoiding both stockouts and overstock.",
      decision: "Pull this when planning a promotional event or evaluating whether to place a reorder — it tells you whether you have enough runway or are at risk of running out.",
      misinterpretations: ["Days on hand should be evaluated against lead time — 30 days on hand is fine if replenishment takes 5 days, but dangerous if lead time is 45 days.", "Aggregate days on hand masks SKU-level imbalance — some items may be critically low while others are overstock."],
      roles: ["Retail Analyst", "Supply Chain Analyst", "Merchandising Analyst"],
    },
    {
      metric: "Gross Merchandise Value (GMV)",
      formula: "Total Sales Value of Merchandise Transacted",
      why: "Measures total transaction volume on a platform, including marketplace sales. The top-line growth metric for marketplace and platform businesses.",
      decision: "Pull this when reporting overall platform health or comparing growth across periods — it's the headline metric for marketplaces like Amazon or Shopify merchants reporting to investors.",
      misinterpretations: ["GMV is not revenue — in marketplace businesses, revenue is only the take rate (commission) on GMV. Conflating them overstates the business.", "GMV includes returns and cancellations unless adjusted — 'net GMV' is a cleaner metric."],
      roles: ["E-commerce Analyst", "Marketplace Analyst", "Business Analyst"],
    },
    {
      metric: "Checkout Funnel Drop-off Rate by Step",
      formula: "(Users Who Left at Step N / Users Who Entered Step N) × 100",
      why: "Maps where in the multi-step checkout process users abandon. Pinpoints the exact friction point so CRO teams can fix the right thing.",
      decision: "Pull this when conversion rate drops and you've already confirmed it's happening at checkout — the step-by-step view tells you whether the problem is account creation, shipping cost reveal, or payment entry.",
      misinterpretations: ["Drop-off at the payment step is often a payment method issue, not a UX problem — check what payment options are available and whether they match your customer demographics.", "Step-level drop-off should be compared to historical baseline, not just industry benchmark — each site's checkout architecture is different."],
      roles: ["E-commerce Analyst", "CRO Analyst", "UX Analyst"],
    },
  ],

  healthcare: [
    {
      metric: "Hospital Readmission Rate",
      formula: "(Patients Readmitted Within 30 Days / Total Discharged Patients) × 100",
      why: "Measures the percentage of patients who return to hospital within 30 days of discharge. A core quality-of-care indicator and a CMS penalty trigger.",
      decision: "Pull this when evaluating care transition programs or discharge planning effectiveness — it's the outcome metric for any post-discharge intervention.",
      misinterpretations: ["30-day readmission includes unrelated diagnoses unless risk-adjusted — raw readmission rate without case-mix adjustment penalizes hospitals that serve sicker populations.", "A reduction in readmissions isn't always an improvement — if the hospital is just observing patients instead of admitting them, the rate improves artificially."],
      roles: ["Healthcare Analyst", "Clinical Data Analyst", "Quality Analyst"],
    },
    {
      metric: "Average Length of Stay (ALOS)",
      formula: "Total Inpatient Days / Total Discharges",
      why: "Measures how long patients stay per admission. Affects capacity, cost, and reimbursement — shorter stays generally lower cost but must not compromise care quality.",
      decision: "Pull this when the CFO asks about capacity utilization or when evaluating a care pathway redesign — ALOS is the bridge between clinical decisions and financial outcomes.",
      misinterpretations: ["ALOS must be risk-adjusted by DRG (diagnosis-related group) — a hospital with sicker patients will naturally have higher ALOS, which is appropriate.", "Reducing ALOS beyond clinical best practice increases readmission risk — these two metrics must be tracked together."],
      roles: ["Healthcare Analyst", "Hospital Operations Analyst", "Revenue Cycle Analyst"],
    },
    {
      metric: "Patient Satisfaction Score (HCAHPS)",
      formula: "Survey-based composite score across care domains (communication, responsiveness, cleanliness, etc.)",
      why: "Standardized CMS survey measuring patient experience. Publicly reported and tied to value-based reimbursement under the Hospital Value-Based Purchasing Program.",
      decision: "Pull this when benchmarking against peer hospitals or when nursing leadership needs to prioritize experience improvements — HCAHPS identifies which care domains are dragging the composite score.",
      misinterpretations: ["HCAHPS captures experience, not outcomes — a patient can have a great experience and poor clinical outcomes, or vice versa.", "Response rate affects reliability — low-response hospitals have noisier scores, which can make trend analysis misleading."],
      roles: ["Healthcare Analyst", "Patient Experience Analyst", "Quality Analyst"],
    },
    {
      metric: "Cost per Discharge (Cost per Case)",
      formula: "Total Hospital Costs / Total Discharges",
      why: "Measures operational efficiency per inpatient case. Under DRG-based reimbursement, the hospital keeps the difference between the fixed payment and actual cost.",
      decision: "Pull this when evaluating clinical resource utilization or when comparing service lines — it reveals which patient populations or procedures are financially sustainable.",
      misinterpretations: ["Cost per discharge varies by case mix — always segment by DRG or service line before drawing conclusions.", "Cost reduction without quality monitoring can lead to worse outcomes that are more expensive long-term (readmissions, complications)."],
      roles: ["Healthcare Financial Analyst", "Cost Analyst", "Hospital Operations Analyst"],
    },
    {
      metric: "Bed Occupancy Rate",
      formula: "(Occupied Beds / Available Beds) × 100",
      why: "Measures capacity utilization. Rates too low indicate underutilized capacity; rates too high (above ~85%) correlate with increased infection risk and care delays.",
      decision: "Pull this when planning staffing levels, evaluating capacity expansion, or diagnosing ED overcrowding — it's the operational heartbeat of a hospital's throughput.",
      misinterpretations: ["An occupancy rate of 100% does not mean the hospital is 'full' — it means surge capacity has already been absorbed and flexibility is gone.", "Occupancy is a lagging indicator of flow — the leading indicators are ED boarding time and OR turnaround time."],
      roles: ["Hospital Operations Analyst", "Capacity Planning Analyst", "Healthcare Analyst"],
    },
    {
      metric: "Claim Denial Rate",
      formula: "(Denied Claims / Total Claims Submitted) × 100",
      why: "Measures the percentage of insurance claims rejected by payers. High denial rates reduce revenue, delay cash flow, and signal documentation or coding problems.",
      decision: "Pull this when revenue cycle leadership sees days in AR climbing — denial rate is usually the upstream cause, and breaking it down by denial reason identifies whether it's a coding, eligibility, or authorization problem.",
      misinterpretations: ["Initial denial rate and final denial rate are different — many denials are overturned on appeal, so focusing only on initial denials overstates true revenue leakage.", "Denial rate by payer reveals which insurance contracts create the most friction — useful for contract renegotiation."],
      roles: ["Revenue Cycle Analyst", "Healthcare Financial Analyst", "Billing Analyst"],
    },
    {
      metric: "Days in Accounts Receivable (Days in AR)",
      formula: "(Total AR / (Annual Revenue / 365))",
      why: "Measures how long it takes to collect payment after a claim is submitted. A key revenue cycle efficiency metric.",
      decision: "Pull this when the CFO is concerned about cash flow — rising days in AR often means either a payer is slow-walking claims or the billing team has a backlog.",
      misinterpretations: ["Days in AR below 35-40 days is generally considered healthy for hospitals — but the benchmark varies by payer mix.", "A sudden drop in days in AR can mean claims are being written off, not collected — check alongside denial rate and write-off rate."],
      roles: ["Revenue Cycle Analyst", "Healthcare Financial Analyst", "Business Office Analyst"],
    },
    {
      metric: "HEDIS Measure Compliance Rate",
      formula: "(Patients Meeting Care Standard / Eligible Population) × 100",
      why: "HEDIS (Healthcare Effectiveness Data and Information Set) measures whether health plans are delivering recommended preventive and chronic care. Tied to plan quality ratings and star scores.",
      decision: "Pull this when the medical director wants to know which care gaps to close first for quality program performance — HEDIS scores directly affect plan star ratings and revenue.",
      misinterpretations: ["HEDIS is measured at the plan level, not the provider level — individual physician performance requires different analytics.", "HEDIS compliance can be improved by documentation improvements alone — sometimes the care is happening but isn't being captured in the data."],
      roles: ["Healthcare Quality Analyst", "Population Health Analyst", "Managed Care Analyst"],
    },
    {
      metric: "Emergency Department (ED) Door-to-Provider Time",
      formula: "Average minutes from patient arrival to first provider contact",
      why: "Measures ED throughput and responsiveness. Long wait times correlate with patient dissatisfaction, left-without-being-seen (LWBS) rates, and poor outcomes for high-acuity patients.",
      decision: "Pull this when ED capacity planning or staffing decisions are being made — door-to-provider time is the operational lever that drives both safety and patient experience scores.",
      misinterpretations: ["Average door-to-provider time masks bimodal distribution — check median and 90th percentile to identify the worst patient experiences.", "Improving door-to-provider time without fixing downstream boarding means patients get seen faster but then wait longer in the ED before a bed is available."],
      roles: ["Healthcare Operations Analyst", "ED Analyst", "Clinical Data Analyst"],
    },
    {
      metric: "Net Collection Rate",
      formula: "(Payments Collected / (Charges − Contractual Adjustments)) × 100",
      why: "Measures how effectively the revenue cycle collects what it is contractually entitled to. The most accurate indicator of revenue cycle performance.",
      decision: "Pull this when evaluating revenue cycle vendor performance or assessing whether a billing process change improved collections — it strips out contractual write-offs that obscure true performance.",
      misinterpretations: ["Net collection rate is often confused with gross collection rate — gross uses total charges (which include chargemaster inflations), while net uses post-contractual-adjustment amounts and is more meaningful.", "A net collection rate below 95% is a warning sign that money is being left on the table through denials, underpayments, or write-offs."],
      roles: ["Revenue Cycle Analyst", "Healthcare Financial Analyst", "Practice Manager Analyst"],
    },
    {
      metric: "Preventable Adverse Event Rate",
      formula: "(Preventable Adverse Events / Total Patient Admissions) × 1,000",
      why: "Tracks patient safety incidents that were avoidable — medication errors, hospital-acquired infections, falls. A core quality and accreditation metric.",
      decision: "Pull this when the quality committee reviews safety data or when a Joint Commission survey is approaching — it identifies whether safety protocols are working.",
      misinterpretations: ["Adverse event rate is undercounted in voluntary reporting systems — actual incident rate is typically 3-10x reported rate.", "Comparing adverse event rates across hospitals is difficult without risk adjustment for patient acuity and procedure complexity."],
      roles: ["Patient Safety Analyst", "Quality Analyst", "Clinical Data Analyst"],
    },
    {
      metric: "Medication Adherence Rate",
      formula: "(Proportion of Days Covered using prescription fill data) × 100",
      why: "Measures whether patients take prescribed medications as directed. Non-adherence drives preventable hospitalizations, particularly in chronic disease populations.",
      decision: "Pull this when a population health program is evaluating whether care management interventions are improving chronic disease control — adherence is a leading indicator of downstream utilization.",
      misinterpretations: ["Proportion of Days Covered (PDC) is not a perfect adherence measure — it assumes medications filled are actually taken.", "Adherence rates differ dramatically by drug class and condition — benchmark within disease category."],
      roles: ["Population Health Analyst", "Pharmacy Analyst", "Managed Care Analyst"],
    },
    {
      metric: "Operating Margin",
      formula: "((Net Revenue − Operating Expenses) / Net Revenue) × 100",
      why: "Measures a hospital's financial sustainability. The primary metric used by hospital boards and rating agencies to evaluate whether the organization can maintain and invest in its operations.",
      decision: "Pull this when leadership is evaluating whether a service line should be expanded, contracted, or subsidized — operating margin by service line tells you which areas generate and which drain financial resources.",
      misinterpretations: ["Negative operating margin in a service line doesn't always mean it should be cut — some service lines (like ED or trauma) are loss leaders that drive inpatient volume elsewhere.", "Non-operating income (investments, donations) can mask poor operating performance — always look at operating margin separately from total margin."],
      roles: ["Healthcare Financial Analyst", "CFO Analyst", "Hospital Finance Analyst"],
    },
    {
      metric: "Staff-to-Patient Ratio",
      formula: "Number of Clinical Staff / Number of Patients (by unit, shift)",
      why: "Measures nursing and clinical staff workload. Evidence shows that understaffing increases adverse events, burnout, and turnover — all of which are expensive.",
      decision: "Pull this when evaluating staffing model changes, scheduling technology ROI, or investigating a spike in adverse events — ratio by unit and shift reveals where workload is unsustainable.",
      misinterpretations: ["Ratio requirements vary by state regulation and unit type — ICU ratios (1:2) differ from med-surg ratios (1:4-6). There is no universal benchmark.", "Average ratio hides shift-level variability — a 1:4 average may mean some shifts are 1:6 while others are 1:2, which has very different patient safety implications."],
      roles: ["Nursing Workforce Analyst", "Healthcare Operations Analyst", "HR Analytics"],
    },
    {
      metric: "Payer Mix",
      formula: "% of Revenue/Volume from Medicare, Medicaid, Commercial, Self-Pay",
      why: "Measures the composition of a hospital's revenue by insurance type. Payer mix determines the effective reimbursement rate and financial risk profile of the organization.",
      decision: "Pull this when projecting revenue impact of policy changes, evaluating a new service line's financial viability, or assessing market strategy — payer mix shifts can change the revenue picture significantly without volume changes.",
      misinterpretations: ["High Medicare/Medicaid mix isn't inherently bad — it depends on whether the organization is efficient enough to make those reimbursement rates work.", "Payer mix should be analyzed by service line, not just at the system level — some departments serve different populations than the aggregate."],
      roles: ["Healthcare Financial Analyst", "Revenue Cycle Analyst", "Strategic Planning Analyst"],
    },
    {
      metric: "Value-Based Care Quality Score",
      formula: "Composite of clinical quality, patient experience, and outcome metrics per CMS program requirements",
      why: "Under value-based payment models (MSSP, BPCI, VBC contracts), quality scores determine bonus or penalty payments on top of base reimbursement.",
      decision: "Pull this when the organization is evaluating which quality improvement initiatives will have the highest financial return — quality scores directly translate to revenue under VBC contracts.",
      misinterpretations: ["Quality scores lag actual performance by 1-2 years in most CMS programs — current improvement efforts won't show up in payments immediately.", "Different VBC programs use different quality measure sets — MSSP ACO measures differ from BPCI measures. Don't conflate programs."],
      roles: ["Value-Based Care Analyst", "Population Health Analyst", "Quality Analyst"],
    },
    {
      metric: "Prior Authorization Approval Rate",
      formula: "(Approved Authorizations / Total Authorization Requests) × 100",
      why: "Measures how often payers approve clinical services before they're rendered. Low approval rates create revenue risk, care delays, and administrative cost.",
      decision: "Pull this when evaluating whether a specific payer contract is creating excessive administrative burden — denial patterns at the authorization stage predict downstream claim denials.",
      misinterpretations: ["Prior authorization denial rate doesn't equal revenue loss — many denials are appealed and overturned, or care is modified to meet authorization criteria.", "Approval rate varies significantly by service type — imaging and specialty drugs have lower approval rates than routine procedures."],
      roles: ["Revenue Cycle Analyst", "Utilization Management Analyst", "Managed Care Analyst"],
    },
    {
      metric: "Population Health Risk Score",
      formula: "Composite risk model output (e.g., HCC Risk Adjustment Factor) based on patient diagnoses and demographics",
      why: "Predicts healthcare utilization and cost for a patient population. Used to stratify patients for care management and to set capitated payment rates.",
      decision: "Pull this when the care management team is deciding which patients to actively manage — risk scores prioritize intervention resources toward the patients most likely to have high utilization.",
      misinterpretations: ["Risk scores predict cost, not clinical need — a patient with a high risk score may be well-managed and stable, while a lower-score patient may be in acute decline.", "Risk scores based on claims data miss undiagnosed conditions — complete documentation is essential for accurate risk capture."],
      roles: ["Population Health Analyst", "Actuarial Analyst", "Managed Care Analyst"],
    },
    {
      metric: "Surgical Site Infection (SSI) Rate",
      formula: "(Surgical Site Infections / Total Surgical Cases) × 100",
      why: "Measures post-surgical infection incidence. SSIs are the most common and costly healthcare-associated infection — CMS publicly reports them and adjusts payments based on performance.",
      decision: "Pull this when the surgical quality committee is evaluating procedural protocols or when comparing performance to the NHSN benchmark — SSI rate is both a patient safety and financial metric.",
      misinterpretations: ["SSI rate must be risk-adjusted by procedure type and patient health status — a colorectal surgeon's SSI rate should not be compared to an orthopedic surgeon's rate.", "Surveillance methodology affects detection rate — hospitals with more rigorous post-discharge surveillance will appear to have higher SSI rates even if care is equivalent."],
      roles: ["Patient Safety Analyst", "Infection Prevention Analyst", "Quality Analyst"],
    },
  ],

  finance: [
    {
      metric: "Return on Equity (ROE)",
      formula: "Net Income / Average Shareholders' Equity",
      why: "Measures how efficiently a company generates profit from shareholders' investment. The primary metric used by equity investors to evaluate management effectiveness.",
      decision: "Pull this when comparing companies within a sector for investment screening, or when evaluating whether management is creating or destroying shareholder value.",
      misinterpretations: ["High ROE can be driven by high debt (financial leverage), not operational excellence — always check alongside Debt-to-Equity ratio.", "ROE is distorted by share buybacks — companies that buy back stock reduce equity, inflating ROE without improving underlying performance."],
      roles: ["Financial Analyst", "Equity Research Analyst", "Investment Analyst"],
    },
    {
      metric: "Earnings Per Share (EPS)",
      formula: "(Net Income − Preferred Dividends) / Weighted Average Shares Outstanding",
      why: "Measures profitability on a per-share basis. The most widely reported corporate performance metric and the denominator in P/E valuation.",
      decision: "Pull this when evaluating earnings trends or setting valuation targets — EPS growth rate is the primary driver of stock price appreciation for mature companies.",
      misinterpretations: ["EPS can be manipulated through share buybacks — a company can grow EPS without growing earnings simply by reducing share count.", "GAAP EPS and adjusted EPS often differ significantly — always identify which one is being discussed and what adjustments were made."],
      roles: ["Financial Analyst", "Equity Research Analyst", "Corporate Finance Analyst"],
    },
    {
      metric: "Price-to-Earnings Ratio (P/E)",
      formula: "Stock Price / Earnings Per Share",
      why: "Measures how much investors pay for each dollar of earnings. The most widely used equity valuation multiple.",
      decision: "Pull this when screening stocks for relative value or when comparing a company's current valuation to its historical average — P/E contextualize whether a stock is expensive or cheap relative to earnings.",
      misinterpretations: ["P/E is meaningless for companies with negative earnings — use alternative multiples like EV/Revenue or EV/EBITDA.", "Trailing P/E uses historical earnings; forward P/E uses analyst estimates — forward P/E is more predictive but dependent on forecast accuracy."],
      roles: ["Financial Analyst", "Equity Research Analyst", "Portfolio Analyst"],
    },
    {
      metric: "Debt-to-Equity Ratio (D/E)",
      formula: "Total Liabilities / Total Shareholders' Equity",
      why: "Measures financial leverage — how much of the business is financed by debt versus equity. High D/E amplifies both returns and risk.",
      decision: "Pull this when assessing credit risk or evaluating whether a company can sustain additional borrowing — it's the first metric credit analysts check before rating a debt instrument.",
      misinterpretations: ["Appropriate D/E varies by industry — utilities operate at high D/E by design; tech companies typically operate at low D/E. Cross-industry comparisons mislead.", "Book value of equity is historical cost — market-value-based D/E is more informative but requires market cap data."],
      roles: ["Financial Analyst", "Credit Analyst", "Corporate Finance Analyst"],
    },
    {
      metric: "EBITDA",
      formula: "Earnings Before Interest, Taxes, Depreciation, and Amortization",
      why: "Approximates operating cash flow by adding back non-cash and financing charges to net income. Used as a proxy for operational performance and in M&A valuation.",
      decision: "Pull this when comparing operational performance across companies with different capital structures or tax jurisdictions, or as the denominator in EV/EBITDA valuation.",
      misinterpretations: ["EBITDA is not cash flow — it ignores working capital changes and capital expenditure requirements that can be enormous.", "EBITDA adds back D&A, but for capital-intensive businesses, those depreciation charges represent real economic costs of asset replacement."],
      roles: ["Financial Analyst", "M&A Analyst", "Corporate Finance Analyst"],
    },
    {
      metric: "Free Cash Flow (FCF)",
      formula: "Operating Cash Flow − Capital Expenditures",
      why: "Measures actual cash generated after maintaining and investing in the business. The most reliable indicator of a company's ability to create value, pay dividends, or repay debt.",
      decision: "Pull this when equity valuation relies on DCF modeling, or when assessing whether a company can sustain its dividend — FCF answers the question that net income cannot.",
      misinterpretations: ["Negative FCF is not always bad — growth companies in investment mode may have negative FCF while building future earning power.", "FCF can be temporarily boosted by cutting capex — always check whether capex is below maintenance levels, which signals underinvestment."],
      roles: ["Financial Analyst", "Equity Research Analyst", "Corporate Finance Analyst"],
    },
    {
      metric: "Current Ratio",
      formula: "Current Assets / Current Liabilities",
      why: "Measures short-term liquidity — whether the company can pay its upcoming obligations. A ratio below 1.0 means current liabilities exceed current assets.",
      decision: "Pull this when assessing a company's near-term financial stability or when a vendor or lender is evaluating credit risk — it's the first liquidity check in any financial analysis.",
      misinterpretations: ["A high current ratio (above 3.0) can indicate inefficient use of assets — excess cash sitting idle or inventory building up.", "Current ratio is a point-in-time snapshot — a company with a 1.5 ratio and rapidly burning cash may be in more trouble than one with a 1.2 ratio and strong cash generation."],
      roles: ["Financial Analyst", "Credit Analyst", "Treasury Analyst"],
    },
    {
      metric: "Net Profit Margin",
      formula: "(Net Income / Revenue) × 100",
      why: "Measures what percentage of revenue becomes profit after all expenses. The bottom-line efficiency metric.",
      decision: "Pull this when comparing profitability across companies or evaluating whether a new product line is accretive to overall margins — it's the ultimate scorecard for every revenue dollar.",
      misinterpretations: ["Net margin varies enormously by industry — grocery retail operates at 1-3% margin; software companies may operate at 20-30%. Cross-industry comparison is misleading.", "Net margin can be temporarily inflated by one-time items (asset sales, tax benefits) — always check for non-recurring items in the footnotes."],
      roles: ["Financial Analyst", "Corporate Finance Analyst", "Business Analyst"],
    },
    {
      metric: "Return on Assets (ROA)",
      formula: "(Net Income / Average Total Assets) × 100",
      why: "Measures how efficiently a company generates profit from all of its assets. Useful for comparing companies with different capital structures.",
      decision: "Pull this when evaluating asset-heavy businesses (manufacturing, utilities, hospitals) to understand whether assets are deployed productively.",
      misinterpretations: ["ROA is less meaningful for financial firms (banks, insurance) where assets include loans and investments that work differently from operating assets.", "Average total assets should be used (beginning + ending / 2) to avoid distortion from mid-period acquisitions."],
      roles: ["Financial Analyst", "Corporate Finance Analyst", "Investment Analyst"],
    },
    {
      metric: "Operating Leverage",
      formula: "% Change in Operating Income / % Change in Revenue",
      why: "Measures how sensitive operating income is to revenue changes. High operating leverage amplifies both gains in up-cycles and losses in down-cycles.",
      decision: "Pull this when stress-testing a financial model under different revenue scenarios — a company with high operating leverage needs to be modeled with a wider range of outcomes.",
      misinterpretations: ["Operating leverage is not the same as financial leverage — one is about cost structure (fixed vs. variable costs), the other is about debt in the capital structure.", "High operating leverage is not inherently bad — it's a feature of scalable businesses like software that become highly profitable as revenue grows."],
      roles: ["Financial Analyst", "Corporate Finance Analyst", "FP&A Analyst"],
    },
    {
      metric: "Accounts Receivable Turnover (DSO)",
      formula: "Days Sales Outstanding = (AR / Revenue) × Days in Period",
      why: "Measures how quickly a company collects payment from customers. High DSO ties up working capital and can signal collection problems or customer financial stress.",
      decision: "Pull this when evaluating working capital efficiency or when assessing whether a B2B company's customers are paying on time — rising DSO is an early warning sign of customer credit deterioration.",
      misinterpretations: ["DSO varies by industry and payment terms — a 45-day DSO may be excellent in construction and concerning in retail.", "DSO can be artificially compressed by factoring receivables — check for off-balance-sheet financing arrangements."],
      roles: ["Financial Analyst", "Treasury Analyst", "Credit Analyst"],
    },
    {
      metric: "Weighted Average Cost of Capital (WACC)",
      formula: "(E/V × Re) + (D/V × Rd × (1−T)) where E=equity, D=debt, V=total value, Re=cost of equity, Rd=cost of debt, T=tax rate",
      why: "The minimum return a company must earn on its invested capital to satisfy all stakeholders. Used as the discount rate in DCF valuation.",
      decision: "Pull this when building a DCF model or evaluating whether a capital project creates or destroys value — any project with returns above WACC creates value; below WACC destroys it.",
      misinterpretations: ["WACC inputs (especially cost of equity using CAPM) involve significant estimation uncertainty — small changes in beta or equity risk premium change WACC materially.", "WACC represents today's cost of capital — for long-horizon projects, it may need to be adjusted for expected future capital structure changes."],
      roles: ["Financial Analyst", "Investment Banker", "Corporate Finance Analyst"],
    },
    {
      metric: "Sharpe Ratio",
      formula: "(Portfolio Return − Risk-Free Rate) / Portfolio Standard Deviation",
      why: "Measures risk-adjusted return — how much excess return is generated per unit of risk. The primary metric for comparing investment strategies or portfolio managers.",
      decision: "Pull this when evaluating competing investment strategies or portfolio managers — a higher Sharpe ratio means better return per unit of risk taken.",
      misinterpretations: ["Sharpe ratio uses standard deviation as the risk measure, which penalizes upside volatility equally with downside — Sortino ratio addresses this by using only downside deviation.", "A Sharpe ratio below 1.0 is generally considered poor, above 2.0 is very good — but context matters; these benchmarks assume normal market conditions."],
      roles: ["Investment Analyst", "Portfolio Analyst", "Risk Analyst"],
    },
    {
      metric: "Loan-to-Value Ratio (LTV) — Banking/Lending",
      formula: "(Loan Amount / Appraised Asset Value) × 100",
      why: "Measures the credit risk of a collateralized loan. High LTV means the lender has less cushion if the borrower defaults and the asset must be liquidated.",
      decision: "Pull this when underwriting a mortgage, auto loan, or commercial real estate loan — LTV determines whether PMI is required, what interest rate applies, and whether the loan meets secondary market standards.",
      misinterpretations: ["LTV uses appraised value at origination — as asset values decline (e.g., real estate crash), LTV increases, turning performing loans into underwater positions.", "Combined LTV (CLTV) must be used when there are multiple liens — a first mortgage at 70% LTV with a second mortgage brings CLTV to 90%+."],
      roles: ["Credit Analyst", "Mortgage Analyst", "Lending Analyst"],
    },
    {
      metric: "Revenue Growth Rate",
      formula: "((Current Period Revenue − Prior Period Revenue) / Prior Period Revenue) × 100",
      why: "The most fundamental performance metric for any growth-stage or public company. Tells the story of whether the business is gaining or losing market momentum.",
      decision: "Pull this when setting investor expectations, evaluating market share trends, or stress-testing a long-range plan — revenue growth rate is the starting assumption for almost every financial model.",
      misinterpretations: ["High revenue growth rate from acquisitions is fundamentally different from organic growth — always separate M&A contribution from organic performance.", "Year-over-year growth rates are distorted by base effects — a company that had a COVID-related revenue collapse in 2020 may show 100%+ growth in 2021 without actually being a high-growth business."],
      roles: ["Financial Analyst", "FP&A Analyst", "Equity Research Analyst"],
    },
    {
      metric: "Inventory Turnover — Finance Context",
      formula: "COGS / Average Inventory",
      why: "In financial analysis, inventory turnover reveals working capital efficiency and business model quality. High-turnover businesses are more capital-efficient and generate more cash.",
      decision: "Pull this in retail and manufacturing financial analysis when assessing whether management is running the balance sheet efficiently — a declining turnover trend signals growing inventory risk.",
      misinterpretations: ["Inventory turnover comparisons must be within-industry — a grocery chain turning inventory 20x per year cannot be compared to a jewelry retailer turning 2x.", "Turnover can be artificially high if COGS is rising due to input cost inflation rather than improved sales velocity."],
      roles: ["Financial Analyst", "Equity Research Analyst", "Corporate Finance Analyst"],
    },
    {
      metric: "Capital Expenditure (CapEx) as % of Revenue",
      formula: "(Capital Expenditures / Revenue) × 100",
      why: "Measures how much of revenue is reinvested in physical assets. Low CapEx-to-revenue ratio is a hallmark of scalable, asset-light businesses; high ratio indicates capital-intensive operations.",
      decision: "Pull this when comparing business model quality across industries or evaluating FCF sustainability — CapEx intensity determines how much of EBITDA actually converts to free cash flow.",
      misinterpretations: ["Maintenance CapEx (replacing existing assets) and growth CapEx (investing in new capacity) have very different implications — total CapEx doesn't tell you which one is driving the spend.", "High CapEx in a growth phase may be a positive signal of investment in future capacity, not a negative signal of inefficiency."],
      roles: ["Financial Analyst", "FP&A Analyst", "Investment Analyst"],
    },
    {
      metric: "Gross Margin — Finance Context",
      formula: "((Revenue − COGS) / Revenue) × 100",
      why: "In financial analysis, gross margin is the first indicator of business model quality and pricing power. High gross margin businesses generate more resources to fund growth and weather downturns.",
      decision: "Pull this when evaluating whether price increases or input cost inflation are affecting unit economics — expanding margin signals pricing power; compressing margin signals cost pressure or competitive pricing.",
      misinterpretations: ["Gross margin comparisons must account for revenue recognition policy — some companies capitalize costs that others expense, creating non-comparable margins.", "Gross margin improvement from product mix shift is structurally different from improvement through cost reduction or pricing — both look the same at the gross margin line."],
      roles: ["Financial Analyst", "FP&A Analyst", "Equity Research Analyst"],
    },
  ],

  operations: [
    {
      metric: "On-Time Delivery Rate (OTD)",
      formula: "(Orders Delivered On or Before Promised Date / Total Orders Delivered) × 100",
      why: "Measures supply chain reliability from the customer's perspective. OTD is the most direct measure of whether the supply chain is meeting its commitments.",
      decision: "Pull this when customer complaints about late deliveries are rising or when a major contract is up for renewal — OTD is the first metric buyers examine when evaluating supplier performance.",
      misinterpretations: ["On-time is only as good as the promise date — a company that consistently sets loose delivery windows will have a high OTD but poor customer experience.", "OTD should be segmented by lane, carrier, and product type — aggregate OTD masks where specific failures are occurring."],
      roles: ["Supply Chain Analyst", "Logistics Analyst", "Operations Analyst"],
    },
    {
      metric: "Inventory Turnover — Operations Context",
      formula: "COGS / Average Inventory Value",
      why: "Measures how quickly inventory is cycled through the supply chain. Higher turnover means less cash tied up in inventory and lower storage cost.",
      decision: "Pull this when optimizing reorder points or evaluating whether a new vendor's lead time is creating excess safety stock — inventory turnover tells you whether the supply chain is holding too much or too little.",
      misinterpretations: ["Very high turnover can mean stockouts — always monitor alongside in-stock rate or fill rate to ensure high turns aren't coming at the cost of availability.", "Turnover is a lagging indicator — it reflects past sales velocity and may not predict future demand patterns, especially in volatile categories."],
      roles: ["Supply Chain Analyst", "Inventory Analyst", "Operations Analyst"],
    },
    {
      metric: "Perfect Order Rate",
      formula: "(Orders with No Errors / Total Orders) × 100 — errors include late, incomplete, damaged, or inaccurate documentation",
      why: "A composite metric that captures order fulfillment quality across multiple dimensions simultaneously. The most comprehensive supply chain performance indicator.",
      decision: "Pull this when executive leadership wants a single supply chain health number — perfect order rate condenses OTD, fill rate, damage rate, and documentation accuracy into one metric.",
      misinterpretations: ["Even small individual error rates compound dramatically in a perfect order calculation — 98% × 98% × 98% × 98% = 92.2% perfect order rate. Don't assume individual metric performance translates linearly.", "Perfect order rate can be gamed by relaxing any one component — make sure all sub-metrics (OTD, fill rate, damage, documentation) are tracked individually as well."],
      roles: ["Supply Chain Analyst", "Operations Analyst", "Logistics Analyst"],
    },
    {
      metric: "Cash-to-Cash Cycle Time (C2C)",
      formula: "Days Inventory Outstanding + Days Sales Outstanding − Days Payable Outstanding",
      why: "Measures the time between paying for raw materials and receiving payment from customers. Shorter C2C means less working capital trapped in the supply chain.",
      decision: "Pull this when evaluating working capital efficiency or when supply chain finance programs are being considered — C2C tells you where cash is sitting in the pipeline.",
      misinterpretations: ["Negative C2C (like Amazon or Walmart) means the company is essentially funded by suppliers and customers — it's a structural advantage, not a red flag.", "Reducing C2C through extending payables can damage supplier relationships — always evaluate working capital improvement holistically."],
      roles: ["Supply Chain Analyst", "Finance Analyst", "Operations Analyst"],
    },
    {
      metric: "Supplier On-Time Performance (SOTD)",
      formula: "(Supplier Deliveries Received On Time / Total Supplier Deliveries) × 100",
      why: "Measures how reliably suppliers deliver materials on schedule. Supplier performance is a leading indicator of production disruptions and downstream OTD problems.",
      decision: "Pull this when evaluating supplier scorecards for contract renewal, when supply disruptions are causing production downtime, or when sourcing decisions require risk assessment.",
      misinterpretations: ["SOTD measures schedule adherence, not quality — a supplier that delivers on time but with defects is not a good supplier.", "SOTD must be measured at the component level, not just the supplier level — a supplier may be reliable on most items but consistently late on one critical component."],
      roles: ["Supply Chain Analyst", "Procurement Analyst", "Vendor Management Analyst"],
    },
    {
      metric: "Order Fill Rate",
      formula: "(Order Lines Shipped Complete / Total Order Lines) × 100",
      why: "Measures the percentage of customer orders fulfilled completely on the first shipment. A direct indicator of inventory positioning and availability.",
      decision: "Pull this when diagnosing service failures — a low fill rate means inventory is either insufficient or in the wrong location, causing partial shipments and customer frustration.",
      misinterpretations: ["Line fill rate and order fill rate are different — line fill measures individual SKU availability, order fill measures complete orders. Order fill is typically lower.", "Fill rate should be measured at the time of the promise, not at the time of fulfillment — a high fill rate achieved by delaying fulfillment isn't truly high availability."],
      roles: ["Supply Chain Analyst", "Inventory Analyst", "Logistics Analyst"],
    },
    {
      metric: "Capacity Utilization Rate",
      formula: "(Actual Output / Maximum Possible Output) × 100",
      why: "Measures how efficiently production capacity is being used. Too low means excess cost; too high means risk of bottlenecks, quality issues, and inability to surge.",
      decision: "Pull this when making capital investment decisions about adding capacity, or when production delays suggest a bottleneck — utilization rate by work center identifies the constraint.",
      misinterpretations: ["100% utilization is not the target — most operations run optimally at 80-85%, reserving capacity for surges and preventing quality degradation from overloading equipment and people.", "Aggregate utilization rate hides bottleneck stations — a plant may average 75% utilization while one critical station runs at 100% and creates a throughput constraint."],
      roles: ["Operations Analyst", "Manufacturing Analyst", "Industrial Engineer Analyst"],
    },
    {
      metric: "Freight Cost per Unit Shipped",
      formula: "Total Freight Costs / Units Shipped",
      why: "Measures the transportation cost efficiency of the supply chain. A key operational cost driver that directly impacts gross margin.",
      decision: "Pull this when evaluating carrier rate negotiations, modal shift opportunities (air to ocean), or network design decisions — freight cost per unit is the apples-to-apples transportation efficiency metric.",
      misinterpretations: ["Freight cost per unit varies by weight, dimensions, distance, and mode — comparing across product categories without normalizing for these factors misleads.", "Reducing freight cost per unit by routing slower (ocean vs. air) may create hidden costs through lost sales or higher inventory requirements."],
      roles: ["Logistics Analyst", "Supply Chain Analyst", "Transportation Analyst"],
    },
    {
      metric: "Warehouse Picking Accuracy",
      formula: "(Orders Picked Correctly / Total Orders Picked) × 100",
      why: "Measures fulfillment accuracy at the warehouse level. Picking errors cause returns, customer dissatisfaction, and re-shipping costs that multiply the original error cost.",
      decision: "Pull this when investigating root causes of return rate increases or when evaluating whether a new warehouse management system (WMS) improved operations.",
      misinterpretations: ["Picking accuracy above 99.5% is generally considered best-in-class — small improvements at high accuracy levels can be very costly to achieve.", "Accuracy rate hides volume — a 99.5% accuracy rate on 1,000 orders means 5 errors per day; on 100,000 orders it means 500 errors per day."],
      roles: ["Warehouse Analyst", "Operations Analyst", "Fulfillment Analyst"],
    },
    {
      metric: "Manufacturing Defect Rate (First Pass Yield)",
      formula: "(Units Produced Without Defect on First Attempt / Total Units Attempted) × 100",
      why: "Measures production quality at the source. Defects caught early are cheaper to fix; defects that reach the customer are the most expensive.",
      decision: "Pull this when root cause analysis is needed for a warranty claim spike or customer complaint pattern — first pass yield by work center or product line isolates where quality is breaking down.",
      misinterpretations: ["First pass yield only captures defects found during production — escaped defects (found by customers) require a separate field quality tracking system.", "Improving first pass yield by tightening quality gates may increase WIP (work-in-process) inventory if rework volume increases."],
      roles: ["Manufacturing Analyst", "Quality Analyst", "Operations Analyst"],
    },
    {
      metric: "Overall Equipment Effectiveness (OEE)",
      formula: "Availability × Performance × Quality (expressed as %)",
      why: "The gold-standard manufacturing efficiency metric. OEE captures the three main sources of production loss: equipment downtime, speed loss, and defects.",
      decision: "Pull this when identifying where to focus maintenance or process improvement investment — OEE by machine or line tells you whether losses are from breakdowns, underperformance, or quality issues.",
      misinterpretations: ["World-class OEE is typically 85%+ — most manufacturers run at 40-60%, which means significant opportunity exists. Don't interpret 60% OEE as poor without benchmarking.", "The three components (Availability, Performance, Quality) have very different improvement strategies — always decompose OEE before prescribing a fix."],
      roles: ["Manufacturing Analyst", "Operations Analyst", "Reliability Analyst"],
    },
    {
      metric: "Lead Time (Order-to-Ship)",
      formula: "Average days from order receipt to shipment",
      why: "Measures supply chain responsiveness. Short lead times enable customers to carry less inventory; long lead times create supply chain fragility.",
      decision: "Pull this when evaluating competitive positioning in markets where delivery speed is a differentiator, or when forecasting safety stock requirements — lead time variability is as important as average lead time.",
      misinterpretations: ["Lead time and transit time are different — lead time is order-to-ship, while total cycle time includes transit. Customers care about total cycle time.", "Reducing average lead time while increasing variability can make the supply chain harder to plan despite the lower average."],
      roles: ["Supply Chain Analyst", "Operations Analyst", "Logistics Analyst"],
    },
    {
      metric: "Shrinkage Rate — Operations/Retail",
      formula: "(Inventory Shrinkage / Total Inventory Value) × 100",
      why: "Measures inventory loss from theft, damage, administrative error, or supplier fraud. A major profit leak in retail and warehouse operations.",
      decision: "Pull this when investigating gross margin shortfalls that aren't explained by pricing or cost changes — shrinkage is often a hidden drain that doesn't surface until physical inventory counts.",
      misinterpretations: ["Shrinkage rate is only as accurate as the cycle counting or physical inventory process — infrequent counts allow shrinkage to accumulate undetected.", "Shrinkage sources (external theft, internal theft, administrative error) require different countermeasures — aggregate shrinkage rate doesn't tell you which intervention to prioritize."],
      roles: ["Retail Operations Analyst", "Loss Prevention Analyst", "Inventory Analyst"],
    },
    {
      metric: "Forecast Accuracy / Mean Absolute Percentage Error (MAPE)",
      formula: "Mean of |Actual − Forecast| / Actual × 100",
      why: "Measures how accurate demand forecasts are. Poor forecast accuracy drives overstock or stockouts — both of which are expensive.",
      decision: "Pull this when evaluating whether to invest in a new forecasting system or methodology, or when diagnosing the root cause of inventory inefficiencies — MAPE by category reveals where forecasting is systematically failing.",
      misinterpretations: ["MAPE can be misleadingly large for low-volume SKUs — a 50% error on a product that sells 2 units per week is economically insignificant.", "MAPE penalizes over-forecasting and under-forecasting equally — for seasonal or lumpy demand, asymmetric error metrics (BIAS) may be more meaningful."],
      roles: ["Demand Planning Analyst", "Supply Chain Analyst", "Forecasting Analyst"],
    },
    {
      metric: "Labor Productivity (Units per Labor Hour)",
      formula: "Total Units Produced or Processed / Total Labor Hours",
      why: "Measures workforce efficiency in production or fulfillment operations. Labor is typically the largest variable cost — productivity improvements directly impact margin.",
      decision: "Pull this when evaluating the ROI of automation investments, scheduling changes, or training programs — labor productivity is the output metric for any workforce efficiency initiative.",
      misinterpretations: ["Labor productivity measured purely as units per hour can incentivize speed over quality — always track alongside defect rate and accuracy.", "Productivity comparisons across sites require normalization for product mix complexity, facility layout, and equipment age."],
      roles: ["Operations Analyst", "Manufacturing Analyst", "Workforce Analyst"],
    },
    {
      metric: "Return Rate — Operations Context",
      formula: "(Units Returned / Units Shipped) × 100",
      why: "In operations, return rate drives reverse logistics cost, restocking cost, and inventory value recovery. Understanding return root causes is essential for cost control.",
      decision: "Pull this when freight and fulfillment costs are exceeding budget — returns are often the hidden cost driver that isn't tracked at the same level of rigor as outbound shipments.",
      misinterpretations: ["Not all returns have the same cost — a return that can be restocked is very different from one that must be destroyed or liquidated. Track return disposition alongside rate.", "Return rate spikes may lag the causal event by weeks — a product quality issue in March may not show up in return data until May if customers delay returns."],
      roles: ["Logistics Analyst", "Operations Analyst", "Retail Analyst"],
    },
    {
      metric: "Safety Incident Rate (TRIR)",
      formula: "(Number of Recordable Incidents × 200,000) / Total Hours Worked",
      why: "Measures workplace safety performance. Total Recordable Incident Rate (TRIR) is the OSHA standard metric used for regulatory reporting, insurance underwriting, and contractor qualification.",
      decision: "Pull this when evaluating safety program effectiveness, when a contract requires safety performance certification, or when OSHA inspection history needs to be reviewed — TRIR is the universal language of workplace safety.",
      misinterpretations: ["TRIR measures recordable incidents, not severity — it weights a minor cut requiring a bandage equally with a fracture requiring surgery. Severity-weighted metrics like Days Away Restricted Transfer (DART) provide better risk context.", "Improving TRIR through underreporting is a significant compliance and legal risk — always verify that incident recording culture supports honest reporting."],
      roles: ["Safety Analyst", "Operations Analyst", "EHS Analyst"],
    },
    {
      metric: "Cost per Order Fulfilled",
      formula: "Total Fulfillment Costs / Total Orders Fulfilled",
      why: "Measures the end-to-end operational cost to process and ship one order. The primary efficiency metric for fulfillment center operations.",
      decision: "Pull this when evaluating whether to in-source or outsource fulfillment, when assessing a 3PL vendor's performance, or when modeling the unit economics of a new product line.",
      misinterpretations: ["Cost per order varies by order size and product type — a large heavy order costs more to fulfill than a small light order. Always segment by order profile.", "Reducing cost per order by increasing automation may require capital investment that takes years to recover — model the full payback period, not just the operating cost reduction."],
      roles: ["Fulfillment Analyst", "Operations Analyst", "Supply Chain Analyst"],
    },
  ],

  marketing: [
    {
      metric: "Return on Ad Spend (ROAS)",
      formula: "Revenue Generated from Ads / Ad Spend",
      why: "Measures revenue efficiency of advertising spend. The primary performance metric for paid acquisition channels.",
      decision: "Pull this when evaluating whether to scale, maintain, or cut a paid channel — ROAS tells you whether each dollar of ad spend is generating enough revenue to justify the investment.",
      misinterpretations: ["ROAS measures revenue, not profit — a 4× ROAS on a product with 20% gross margin actually loses money. Always compare ROAS to the break-even ROAS for the product's margin.", "ROAS varies by funnel stage — upper-funnel brand awareness campaigns will naturally have lower ROAS than lower-funnel retargeting. Don't evaluate all campaigns with the same ROAS target."],
      roles: ["Marketing Analyst", "Growth Analyst", "Paid Media Analyst"],
    },
    {
      metric: "Click-Through Rate (CTR)",
      formula: "(Clicks / Impressions) × 100",
      why: "Measures how often people who see an ad or email click on it. A diagnostic metric for creative and messaging relevance.",
      decision: "Pull this when evaluating ad creative performance or email subject line testing — low CTR isolates the problem to the message itself, before the landing page experience.",
      misinterpretations: ["High CTR does not mean high conversion — a misleading ad can generate clicks from the wrong audience who then don't convert. Track CTR alongside conversion rate.", "CTR benchmarks vary dramatically by channel and format — email CTR of 2-3% may be excellent; display ad CTR of 2% would be exceptional (industry average is ~0.1%)."],
      roles: ["Marketing Analyst", "Digital Analyst", "Email Marketing Analyst"],
    },
    {
      metric: "Email Open Rate",
      formula: "(Emails Opened / Emails Delivered) × 100",
      why: "Measures how many recipients open a marketing email. A proxy for subject line effectiveness and list health.",
      decision: "Pull this when diagnosing an email campaign's underperformance — a low open rate means the problem is the subject line or sender reputation, not the email body or offer.",
      misinterpretations: ["Apple's Mail Privacy Protection (MPP) has inflated open rates since 2021 — iOS pre-fetches emails, recording 'opens' even when the email isn't read. Open rates are less reliable than they used to be.", "Open rate is a vanity metric without conversion context — a 40% open rate with 0% click rate means recipients opened but found no compelling reason to act."],
      roles: ["Email Marketing Analyst", "CRM Analyst", "Marketing Analyst"],
    },
    {
      metric: "Cost per Lead (CPL)",
      formula: "Total Marketing Spend / Number of Leads Generated",
      why: "Measures the efficiency of lead generation programs. Used to compare acquisition efficiency across channels and campaign types.",
      decision: "Pull this when the sales team complains about lead volume or quality — CPL by channel shows where leads are cheapest, which must then be paired with lead quality data to find the best-value sources.",
      misinterpretations: ["Low CPL does not mean good leads — a channel that generates cheap leads that never convert is worse than an expensive channel with high close rates. Always pair CPL with lead-to-opportunity conversion rate.", "CPL benchmarks vary enormously by industry and persona — B2B enterprise CPL may be $500+; DTC consumer CPL may be $10-30."],
      roles: ["Marketing Analyst", "Demand Generation Analyst", "Growth Analyst"],
    },
    {
      metric: "Marketing Qualified Lead (MQL) to SQL Conversion Rate",
      formula: "(Sales Qualified Leads / Marketing Qualified Leads) × 100",
      why: "Measures the quality of leads passed from marketing to sales. The primary metric for diagnosing alignment (or misalignment) between marketing and sales teams.",
      decision: "Pull this when sales is complaining about lead quality or when marketing claims they're hitting lead targets but pipeline isn't growing — it reveals whether MQL definitions match real sales-ready criteria.",
      misinterpretations: ["A high MQL-to-SQL conversion rate can be achieved by setting very loose MQL criteria, creating the illusion of efficiency without improving pipeline quality.", "This metric requires clear, agreed-upon definitions of MQL and SQL — without consistent definitions, the metric is meaningless."],
      roles: ["Marketing Analyst", "Revenue Operations Analyst", "Demand Generation Analyst"],
    },
    {
      metric: "Attribution — Multi-Touch Attribution (MTA)",
      formula: "Credit distributed across all touchpoints in the customer journey based on a chosen attribution model (linear, time-decay, position-based, data-driven)",
      why: "Determines which marketing touchpoints drove a conversion. Essential for understanding which channels and campaigns are creating pipeline, not just touching customers.",
      decision: "Pull this when CFO asks which marketing channels are driving actual revenue versus just generating impressions — MTA reveals the full journey, not just the last click.",
      misinterpretations: ["No attribution model is perfect — last-click undercounts upper-funnel channels, first-click undercounts lower-funnel channels. Data-driven MTA is the gold standard but requires large data volumes.", "Cross-device attribution is still an unsolved problem — a customer who sees an ad on mobile and converts on desktop may appear as an organic conversion."],
      roles: ["Marketing Analyst", "Growth Analyst", "Digital Analyst"],
    },
    {
      metric: "Social Media Engagement Rate",
      formula: "(Likes + Comments + Shares + Saves) / Reach × 100",
      why: "Measures how actively an audience interacts with content. Higher engagement signals content relevance and audience health.",
      decision: "Pull this when evaluating organic content strategy performance or when deciding which content formats to scale — engagement rate identifies what resonates, which predicts what will convert.",
      misinterpretations: ["Engagement rate and reach are inversely correlated at scale — large accounts typically have lower engagement rates than small accounts. Benchmark within account-size tiers.", "Engagement can be artificially inflated by controversy or controversy-adjacent content that generates comments without building brand affinity."],
      roles: ["Social Media Analyst", "Content Analyst", "Marketing Analyst"],
    },
    {
      metric: "Churn Rate — Marketing/Subscription Context",
      formula: "(Subscribers Lost in Period / Subscribers at Start of Period) × 100",
      why: "Measures customer retention in subscription or recurring revenue businesses. In marketing, churn is the metric that retention campaigns are measured against.",
      decision: "Pull this when evaluating the ROI of retention marketing (win-back emails, loyalty offers, pause options) — churn rate is the outcome metric every retention initiative must move.",
      misinterpretations: ["Voluntary churn (customer cancels) and involuntary churn (payment failure) have different causes and require different interventions — aggregate churn masks this important distinction.", "Churn rate is a lagging indicator — by the time a customer churns, the reason usually occurred weeks or months earlier. Leading indicators (engagement decline, login frequency) predict churn before it happens."],
      roles: ["CRM Analyst", "Retention Analyst", "Marketing Analyst"],
    },
    {
      metric: "Landing Page Conversion Rate",
      formula: "(Conversions / Total Page Visits) × 100",
      why: "Measures how effectively a landing page turns visitors into leads or customers. The core metric for conversion rate optimization (CRO).",
      decision: "Pull this when a paid campaign has good CTR but low conversion — it isolates the problem to the post-click experience rather than the ad itself.",
      misinterpretations: ["Conversion rate is meaningful only in context of the traffic source — organic traffic typically converts lower than paid retargeting traffic; comparing them directly misleads.", "A high conversion rate on low-quality traffic (wrong audience) produces leads that don't close — always pair with downstream conversion metrics."],
      roles: ["CRO Analyst", "Digital Analyst", "Marketing Analyst"],
    },
    {
      metric: "Net Revenue Retention (NRR) — Marketing/SaaS",
      formula: "(Starting MRR + Expansion MRR − Churned MRR − Contraction MRR) / Starting MRR × 100",
      why: "Measures whether existing customers are spending more or less over time. NRR above 100% means revenue grows even without new customers — the hallmark of best-in-class SaaS businesses.",
      decision: "Pull this when evaluating expansion revenue programs (upsell, cross-sell, seat expansion) or when investor relations needs a single metric for customer revenue health — NRR is the metric that determines long-term business viability.",
      misinterpretations: ["NRR and Gross Revenue Retention (GRR) are different — GRR excludes expansion, showing only what's retained from existing customers without upsell. Both are needed for a complete picture.", "NRR above 130% is considered exceptional (Snowflake, Datadog territory) — don't benchmark against public SaaS leaders without accounting for business model differences."],
      roles: ["Marketing Analyst", "Revenue Operations Analyst", "Customer Success Analyst"],
    },
    {
      metric: "Share of Voice (SOV)",
      formula: "(Brand's Impressions / Total Market Impressions) × 100",
      why: "Measures brand presence relative to competitors in a given market or channel. Brands that outgrow their SOV relative to market share tend to gain market share over time.",
      decision: "Pull this when setting media budget levels or benchmarking brand health — SOV data justifies budget increases by showing the competitive gap that needs to be closed.",
      misinterpretations: ["SOV is difficult to measure precisely — paid SOV (ad impressions) is relatively trackable, but organic/earned SOV requires social listening tools with inherent measurement gaps.", "SOV is not the same as brand preference — a high-SOV brand with poor product quality or negative sentiment will not outperform despite high share of voice."],
      roles: ["Brand Analyst", "Marketing Analyst", "Media Planning Analyst"],
    },
    {
      metric: "Cost per Mille / Cost per Thousand Impressions (CPM)",
      formula: "(Ad Spend / Impressions) × 1,000",
      why: "Measures the cost efficiency of reach campaigns. The standard buying metric for display, video, and social awareness advertising.",
      decision: "Pull this when evaluating media efficiency for brand campaigns where reach and frequency are the goal — CPM tells you how cheaply you can reach your target audience at scale.",
      misinterpretations: ["Low CPM does not mean efficient advertising — cheap impressions to the wrong audience waste budget. Target CPM (cost to reach your specific audience) is more meaningful than gross CPM.", "CPM comparisons across platforms require viewability normalization — an impression on one platform may be a 2-second in-view video; on another it may be a below-the-fold banner never actually seen."],
      roles: ["Media Planning Analyst", "Marketing Analyst", "Digital Analyst"],
    },
    {
      metric: "Organic Search Traffic (SEO)",
      formula: "Total visits / sessions from non-paid search engine results",
      why: "Measures the volume of traffic generated through SEO. Organic traffic has no direct cost per visit, giving it significantly higher ROI than paid traffic at scale.",
      decision: "Pull this when building the business case for SEO investment or when evaluating the impact of a content marketing program — organic traffic growth compounds over time in a way that paid traffic does not.",
      misinterpretations: ["Organic traffic growth doesn't always mean revenue growth — high-volume traffic on informational queries may not convert at the same rate as commercial-intent queries.", "Google algorithm updates can cause sudden drops in organic traffic that are unrelated to any action taken — always check core update timing when diagnosing organic traffic anomalies."],
      roles: ["SEO Analyst", "Content Analyst", "Marketing Analyst"],
    },
    {
      metric: "Brand Awareness Lift",
      formula: "% of Target Audience Aware of Brand After Campaign − % Aware Before Campaign",
      why: "Measures the incremental increase in brand recognition from a marketing campaign. The primary outcome metric for brand advertising investments.",
      decision: "Pull this when evaluating the ROI of brand campaigns that don't generate direct conversion — lift studies provide the evidence that brand advertising is working even when clicks and conversions are low.",
      misinterpretations: ["Brand awareness lift is typically measured through surveys with methodology limitations — sample size, survey design, and control group construction affect reliability.", "Awareness lift doesn't guarantee purchase intent lift — a consumer can become aware of a brand but remain neutral or negative toward it."],
      roles: ["Brand Analyst", "Marketing Analyst", "Insights Analyst"],
    },
    {
      metric: "Customer Lifetime Value to CAC Ratio (LTV:CAC)",
      formula: "Customer Lifetime Value / Customer Acquisition Cost",
      why: "Measures the return on customer acquisition investment. The ratio determines whether the business model is fundamentally sound — acquiring customers is only sensible if their value exceeds the acquisition cost.",
      decision: "Pull this when evaluating marketing efficiency at the business model level or when investors ask about unit economics — LTV:CAC above 3:1 is generally considered healthy for growth-stage businesses.",
      misinterpretations: ["LTV:CAC ratio depends heavily on LTV calculation assumptions (margin, churn rate, discount rate) — small changes in LTV inputs change the ratio significantly.", "Payback period (months to recover CAC from gross margin) is often a more actionable companion metric — a business with LTV:CAC of 5:1 but a 36-month payback may still face cash flow challenges."],
      roles: ["Growth Analyst", "Marketing Analyst", "Revenue Operations Analyst"],
    },
    {
      metric: "A/B Test Statistical Significance",
      formula: "p-value < 0.05 threshold (or confidence interval that excludes zero)",
      why: "Determines whether an observed difference between two variants is real or could be due to random chance. The decision gate for all experimentation-based marketing decisions.",
      decision: "Pull this before declaring any A/B test a winner — shipping a 'winning' variant that isn't statistically significant means you're implementing a random change at scale.",
      misinterpretations: ["Statistical significance at p<0.05 means there is still a 5% chance the result is random — it does not mean the result is definitely real or practically meaningful.", "Peeking at results before a test reaches its required sample size inflates false positive rates — always calculate required sample size before launching and run until that threshold is hit."],
      roles: ["Marketing Analyst", "CRO Analyst", "Data Scientist"],
    },
    {
      metric: "Email List Growth Rate",
      formula: "((New Subscribers − Unsubscribes) / Total List Size) × 100",
      why: "Measures the health and momentum of an owned marketing channel. Email is the highest-ROI owned channel — a growing, engaged list is a compounding business asset.",
      decision: "Pull this when evaluating the effectiveness of list-building programs (lead magnets, pop-ups, referral programs) or when planning for future email revenue projections — list growth rate predicts future email channel capacity.",
      misinterpretations: ["A growing list with declining engagement (open rate, CTR) means list quality is deteriorating even as quantity grows — deliverability and revenue per email will eventually suffer.", "Unsubscribes are healthy — a highly engaged smaller list outperforms a large disengaged list on every revenue metric."],
      roles: ["Email Marketing Analyst", "CRM Analyst", "Marketing Analyst"],
    },
    {
      metric: "Share of Search",
      formula: "(Brand Search Volume / Category Search Volume) × 100",
      why: "Measures the proportion of category-level search intent captured by a brand. Share of search has been shown to be a leading indicator of market share in many categories.",
      decision: "Pull this when benchmarking brand health without expensive survey research — share of search is a free-to-access proxy for brand preference that updates in near real-time via Google Trends or keyword tools.",
      misinterpretations: ["Share of search is a correlate of market share, not a proven causal driver — the relationship varies by category and breaks down in markets where search is not the primary discovery mechanism.", "Brand name searches can be inflated by brand advertising spend — a high share of search campaign may reflect media weight, not genuine brand preference."],
      roles: ["Brand Analyst", "SEO Analyst", "Marketing Analyst"],
    },
  ],
  product: [
  {
    metric: "Daily Active Users (DAU)",
    formula: "Count of unique users who complete a defined 'active' action in a 24-hour period",
    why: "The heartbeat metric of a consumer product. DAU tells you whether your product is part of users' daily routines — which is the primary driver of LTV, monetization, and defensibility.",
    decision: "Pull this when leadership asks whether a product change improved engagement, or when investors want to understand user traction. DAU is the first number every product lead should know cold.",
    misinterpretations: ["'Active' must be defined — a user who opens an app but does nothing meaningful should not count the same as one who completes a core action. Definition drift inflates DAU without reflecting real engagement.", "DAU can grow while the product is declining if your definition of 'active' is loose. Always pair with session depth or core action completion rate."],
    roles: ["Product Analyst", "Growth Analyst", "Data Analyst (Consumer Tech)"],
  },
  {
    metric: "Monthly Active Users (MAU)",
    formula: "Count of unique users who complete a defined 'active' action in a rolling 30-day period",
    why: "Measures the breadth of your engaged user base over a longer window. MAU is the denominator in stickiness (DAU/MAU) and the primary metric for tracking overall platform scale.",
    decision: "Pull this when evaluating market penetration, investor reporting, or comparing growth rates across time periods. MAU smooths out weekly noise and reveals longer-term trajectory.",
    misinterpretations: ["MAU growth from a marketing campaign can inflate the number without improving product quality — always segment MAU by cohort and source to understand who is driving growth.", "MAU that grows while DAU stays flat means new users are not retained into daily habits — a warning sign that acquisition is masking a retention problem."],
    roles: ["Product Analyst", "Growth Analyst", "Business Analyst (Tech)"],
  },
  {
    metric: "DAU/MAU Ratio (Stickiness)",
    formula: "(DAU / MAU) × 100",
    why: "Measures how frequently your monthly users engage daily. The single best proxy for whether your product has become a habit. Industry benchmarks: 50%+ for social/messaging, 20-40% for gaming/news, 13% average for SaaS, 10-25% for fintech.",
    decision: "Pull this when evaluating whether a new feature or notification strategy is changing user habits, or when benchmarking against competitors. Stickiness predicts LTV better than MAU alone.",
    misinterpretations: ["Stickiness benchmarks vary enormously by product type — a 15% ratio is excellent for a tax prep app (monthly usage pattern) and alarming for a messaging app (should be daily). Always benchmark within category.", "Improving stickiness by narrowing the 'active' definition artificially is gaming the metric — the ratio improves but real engagement hasn't."],
    roles: ["Product Analyst", "Growth Analyst", "Product Manager supporting analytics"],
  },
  {
    metric: "D1 / D7 / D30 Retention Rate",
    formula: "(Users who return on Day N after signup / Users who signed up on Day 0) × 100",
    why: "Measures whether new users come back after their first experience. Retention curves define the long-term health of a product — a product that retains at D30 has proven stickiness; one that loses 90% by D7 has a fundamental value problem.",
    decision: "Pull this when evaluating the impact of onboarding changes, push notification strategies, or new feature releases on new user behavior. D1 is the onboarding signal; D7 is the habit signal; D30 is the product-market fit signal.",
    misinterpretations: ["D30 retention of 25% can be excellent (social app) or catastrophic (SaaS product where users should be daily). Always define what 'good' looks like for your specific product before interpreting retention curves.", "Retention curves that flatten after D7 (even at a low absolute rate) are actually a positive signal — it means the remaining users are habituated and likely long-term retained."],
    roles: ["Product Analyst", "Growth Analyst", "Mobile Analyst"],
  },
  {
    metric: "Feature Adoption Rate",
    formula: "(Users who have used the feature at least once / Total eligible users) × 100",
    why: "Measures how widely a new feature has penetrated the user base. Low adoption after 60+ days signals a discoverability problem, a value problem, or a user-fit problem — each requiring a different fix.",
    decision: "Pull this when a product team asks whether their shipped feature is being used, or when deciding whether to invest further in a feature vs. deprecate it. Feature adoption is the input metric for the ship/iterate/kill decision.",
    misinterpretations: ["Adoption rate measures breadth (tried it once), not depth (uses it regularly). A feature with 40% adoption but 5% weekly usage is not working — measure both adoption and retention within the feature.", "Adoption rates below 10% after 90 days usually indicate a discoverability problem, not a value problem — check the entry point before concluding users don't want the feature."],
    roles: ["Product Analyst", "Growth Analyst", "Feature Analytics Lead"],
  },
  {
    metric: "User Activation Rate",
    formula: "(New users who complete the defined activation milestone / Total new signups) × 100",
    why: "Measures whether new users reach their first 'aha moment' — the point where they experience the product's core value. Activation is the most important leading indicator of long-term retention.",
    decision: "Pull this when diagnosing why retention is poor despite healthy acquisition, or when evaluating onboarding flow changes. If activation rate is low, no amount of retention marketing will fix the problem — fix the onboarding first.",
    misinterpretations: ["The activation milestone must be defined carefully — logging in is not activation. The milestone should be the first action that predicts long-term retention in your cohort analysis.", "A high activation rate with low D7 retention means users completed the onboarding but didn't find ongoing value — the activation milestone was too shallow."],
    roles: ["Product Analyst", "Growth Analyst", "Onboarding Analyst"],
  },
  {
    metric: "Time to Value (TTV)",
    formula: "Average time from signup to first completion of the activation milestone (minutes, hours, or days)",
    why: "Measures how quickly new users experience the product's core value. Shorter TTV correlates strongly with higher D1 and D7 retention — users who take too long to reach the 'aha moment' churn before getting there.",
    decision: "Pull this when evaluating onboarding flow changes or signup-to-activation funnel optimization. TTV is the operational metric for the activation improvement roadmap.",
    misinterpretations: ["TTV should be measured in the appropriate unit for your product — 5 minutes is an appropriate TTV target for a messaging app, 2 days might be appropriate for a project management tool.", "Reducing TTV by removing steps can actually reduce activation quality — always pair TTV reduction with activation rate and D7 retention to confirm quality held."],
    roles: ["Product Analyst", "Growth Analyst", "Onboarding Analyst"],
  },
  {
    metric: "Session Length",
    formula: "Average time between the first and last event of a user session (in minutes)",
    why: "Measures how deeply users engage when they do use the product. Longer sessions generally indicate higher engagement, though the interpretation depends heavily on the product type.",
    decision: "Pull this when evaluating whether a new feature increased user engagement depth, or when diagnosing why ARPU (average revenue per user) is declining despite stable DAU.",
    misinterpretations: ["Longer session length is not always better — in a fintech app, shorter sessions with task completion are ideal. In a social app, longer sessions indicate engagement. Context defines the benchmark.", "Average session length masks bimodal distributions — power users having 60-minute sessions and casual users having 30-second sessions can produce a misleading average of 5 minutes."],
    roles: ["Product Analyst", "Mobile Analyst", "Engagement Analyst"],
  },
  {
    metric: "Session Frequency",
    formula: "Average number of sessions per active user per week (or day)",
    why: "Measures how often users return within a given period. Complements DAU/MAU by showing not just whether users return, but how often they do when they are active.",
    decision: "Pull this when designing push notification strategies, evaluating re-engagement campaign effectiveness, or understanding whether a feature change deepened habitual use.",
    misinterpretations: ["Session frequency must be evaluated in the context of the product's expected usage pattern. Weekly usage of a budgeting app is appropriate; weekly usage of a messaging app is churn-risk behavior.", "Increasing session frequency through aggressive notifications can inflate the metric while degrading user satisfaction — always track alongside NPS and notification opt-out rate."],
    roles: ["Product Analyst", "Engagement Analyst", "Mobile Analyst"],
  },
  {
    metric: "Core Action Completion Rate",
    formula: "(Users who completed the defined core action in a period / Total active users in that period) × 100",
    why: "Measures engagement with the single action that defines your product's value — sending a message, completing a workout, making a payment, posting content. This is the most product-specific and often most predictive metric.",
    decision: "Pull this when evaluating whether a UI change improved the primary user behavior, or when identifying users at risk of churn (users who stop completing the core action before they cancel).",
    misinterpretations: ["The core action must be defined specifically enough to be meaningful — 'using the app' is not a core action. The action should be the behavior that, if stopped, signals the user is no longer getting value.", "Core action completion rate can decline as the user base grows (more casual users lower the average) even as total core actions increase — normalize by cohort or user segment for a cleaner signal."],
    roles: ["Product Analyst", "Engagement Analyst", "Feature Analytics Lead"],
  },
  {
    metric: "Notification Opt-in Rate",
    formula: "(Users who have opted in to push notifications / Total eligible users) × 100",
    why: "Measures the health of your re-engagement channel. Push notifications are the most direct way to drive return visits — users who opt in have dramatically higher D30 retention than those who don't.",
    decision: "Pull this when evaluating the ROI of notification-driven re-engagement, or when deciding whether to prompt for notification permission earlier or later in onboarding.",
    misinterpretations: ["Opt-in rate varies dramatically by platform — iOS requires explicit permission (opt-in rates typically 40-60%), Android historically defaulted to on (opt-in rates 90%+). Compare within platform.", "High opt-in rate means nothing if notification click-through rate is low — users may have opted in but be ignoring your messages, which will eventually lead to opt-out."],
    roles: ["Product Analyst", "Mobile Analyst", "Growth Analyst"],
  },
  {
    metric: "K-Factor (Virality Coefficient)",
    formula: "K = (Average invitations sent per user) × (Conversion rate of invitations to signups)",
    why: "Measures organic growth from existing users. K > 1 means the user base grows exponentially without paid acquisition; K < 1 means the product has some viral component but requires external input to sustain growth.",
    decision: "Pull this when evaluating the ROI of referral programs, or when the growth team is deciding whether to invest in viral mechanics vs. paid acquisition. K-factor determines whether viral investment compounds.",
    misinterpretations: ["K > 1 is rarely sustained — products that achieve viral growth typically see K decay as the addressable network saturates. Use K-factor as a directional signal, not a permanent growth assumption.", "K-factor can be gamed by incentivizing invitations artificially — referred users who converted for the incentive rather than the product value will have lower retention, dragging down LTV even as K looks healthy."],
    roles: ["Growth Analyst", "Product Analyst", "Marketing Analyst"],
  },
  {
    metric: "Churn Rate (Product Context)",
    formula: "(Users who were active in period N-1 but not in period N / Users active in period N-1) × 100",
    why: "Measures the rate at which previously active users stop engaging. Product churn is a leading indicator of revenue churn in subscription businesses and a direct signal of product-market fit degradation.",
    decision: "Pull this when a cohort analysis shows a steeper-than-expected retention curve, or when DAU is declining despite stable new user acquisition. Churn tells you whether you have a retention problem or a growth problem.",
    misinterpretations: ["Product churn and revenue churn are different — a user can churn from daily usage while still paying for the subscription, especially in SaaS. Both should be tracked independently.", "Churn rate measured over too short a window (weekly) is noisy; measured over too long a window (annual) it lags. Monthly is typically the right interval for most consumer products."],
    roles: ["Product Analyst", "Retention Analyst", "Growth Analyst"],
  },
  {
    metric: "Monthly Active Creator Rate",
    formula: "(Users who created content in the past 30 days / Total MAU) × 100",
    why: "In content platforms (social, UGC, marketplaces), creation is the highest-engagement behavior and the behavior that generates supply for other users. Creator retention predicts platform health better than consumer retention.",
    decision: "Pull this when evaluating the health of a two-sided platform or content marketplace. If creator rate declines, content supply thins, which reduces consumer engagement — a flywheel problem that compounds.",
    misinterpretations: ["The ratio of creators to consumers varies naturally by platform type — Twitter historically had ~10% creator rate; YouTube has ~1%. Benchmark within content category.", "Creator rate can decline as a platform scales if new users skew more toward consumption. Segment by cohort to understand whether the platform is becoming more consumer-oriented or whether creators are churning."],
    roles: ["Product Analyst", "Platform Analyst", "Content Analyst"],
  },
  {
    metric: "User Activation Funnel Drop-off Rate",
    formula: "(Users who exited at step N / Users who entered step N) × 100 — across each onboarding step",
    why: "Maps where in the onboarding flow new users abandon before reaching activation. The most actionable diagnostic for improving activation rate — each step has a different cause and fix.",
    decision: "Pull this when activation rate is below target and you need to identify the specific step to fix. Drop-off at the permission request is different from drop-off at the first core action — completely different engineering and design interventions.",
    misinterpretations: ["Funnel drop-off rates look alarming in aggregate but are often concentrated at 1-2 specific steps. Fix the highest-drop-off step first before addressing later steps — later steps may self-correct once earlier friction is removed.", "Drop-off rates vary by acquisition channel — paid social users drop off at higher rates than organic users in almost every funnel. Always segment by acquisition source before concluding the product is broken."],
    roles: ["Product Analyst", "Growth Analyst", "Onboarding Analyst"],
  },
  {
    metric: "Support Ticket Rate",
    formula: "(Support tickets submitted / Active users) × 1,000 (tickets per 1K users)",
    why: "A leading indicator of product friction and quality issues. Spikes in support ticket rate before they appear in retention or DAU metrics — giving teams an early warning signal to investigate.",
    decision: "Pull this after a major product release or infrastructure change to detect issues before they become retention problems. Also useful for identifying which features generate the most confusion.",
    misinterpretations: ["Low ticket rate doesn't always mean the product is frictionless — users who give up without contacting support are invisible. Pair with session recordings and rage-click data for a complete picture.", "Support ticket rate should be normalized by active users, not total users — a product with more engagement will naturally generate more tickets in absolute terms even if per-user friction is constant."],
    roles: ["Product Analyst", "CX Analyst", "Quality Analyst"],
  },
  {
    metric: "Power User Concentration (Top Decile Share)",
    formula: "(Core actions completed by top 10% of users / Total core actions by all users) × 100",
    why: "Measures how dependent the product's engagement is on a small segment of highly active users. High concentration (top 10% driving 60%+ of actions) signals fragility — losing power users would devastate engagement metrics.",
    decision: "Pull this when evaluating the diversity of the user engagement base, or when a large customer or power user churns and the impact on aggregate metrics seems disproportionately large.",
    misinterpretations: ["Some power user concentration is healthy and expected — it does not mean the product is failing. The risk is when concentration is so high that product metrics are essentially tracking a handful of users rather than the population.", "Power user concentration often increases as a product matures and casual users churn. A rising concentration trend over time signals retention is improving at the top while casual users are leaving — which may or may not be a problem depending on the business model."],
    roles: ["Product Analyst", "Engagement Analyst", "Data Scientist"],
  },
  {
    metric: "Net Promoter Score — Product Context (pNPS)",
    formula: "% of users rating 9-10 (Promoters) − % rating 0-6 (Detractors), asked about product experience specifically",
    why: "In product analytics, NPS is used to track sentiment change after feature releases, redesigns, or UX changes. Product NPS distinguishes the product experience from the overall brand/support experience.",
    decision: "Pull this when evaluating whether a major product change improved or degraded user sentiment, or when trying to identify which user segments are most and least satisfied with the current product direction.",
    misinterpretations: ["Product NPS and relationship NPS are different — product NPS asks about a specific experience or feature; relationship NPS asks about the overall brand. Conflating them produces misleading signals.", "NPS surveys suffer from response bias — dissatisfied users are more likely to respond than neutral users, which means raw NPS often skews negative. Segment by tenure, usage level, and acquisition source for a cleaner read."],
    roles: ["Product Analyst", "UX Researcher", "Customer Insights Analyst"],
  },
  ],
};

// ── KPI LIBRARY MODE COMPONENT ────────────────────────────────────────────────

const KPI_DOMAINS = [
  { id: "retail",     label: "Retail / E-commerce", color: "#4fc3f7", icon: "🛒" },
  { id: "healthcare", label: "Healthcare",           color: "#f87171", icon: "🏥" },
  { id: "finance",    label: "Finance",              color: "#4ade80", icon: "📈" },
  { id: "operations", label: "Operations / Supply Chain", color: "#fb923c", icon: "⚙️" },
  { id: "marketing",  label: "Marketing",            color: "#c084fc", icon: "📣" },
  { id: "product", label: "Product Analytics", color: "#a78bfa", icon: "📱" },
];

// ── INTEL MODE WRAPPER + MODES 2/3 ─────────────────────────────────────────
// IntelMode = parent component with sub-mode selector
// Sub-modes: KPI Library (existing), Dashboard Drills (Mode 2), Problem-to-Metric (Mode 3)
// Mode 4 (Insight & Recommendation) deferred to Session 4

// ── DASHBOARD DRILL DATA (Mode 2) ──────────────────────────────────────────
// 5 drills, 1 per domain. Each drill: scenario, dashboard JSX, 3 questions, gold answers.

const DASHBOARD_DRILLS = [
  {
    id: "retail-1",
    domain: "retail",
    title: "Weekly E-commerce Performance",
    subtitle: "Compared to prior 4-week average",
    scenario: "You are the senior analyst on the e-commerce team at a mid-market apparel brand. Your weekly review meeting starts in 15 minutes. The Head of E-commerce just dropped this dashboard in your inbox with the message: \"What's going on here?\"",
    kpis: [
      { label: "SESSIONS", value: "142,580", delta: "▲ 18.2%", up: true },
      { label: "CONVERSION RATE", value: "1.84%", delta: "▼ 22.4%", up: false },
      { label: "AOV", value: "$78.40", delta: "▼ 3.1%", up: false },
      { label: "REVENUE", value: "$205,710", delta: "▼ 9.8%", up: false },
    ],
    charts: [
      {
        type: "lineMulti",
        title: "SESSIONS BY TRAFFIC SOURCE — LAST 4 WEEKS",
        series: [
          { label: "Organic", color: "#4fc3f7", points: [60, 58, 56, 54] },
          { label: "Direct/Email", color: "#4ade80", points: [40, 42, 44, 46] },
          { label: "Paid Social", color: "#fbbf24", points: [10, 12, 15, 78] },
        ],
        xLabels: ["Apr 7", "Apr 14", "Apr 21", "Apr 28"],
        yMax: 80,
      },
      {
        type: "barCategorical",
        title: "CONVERSION RATE BY SOURCE — THIS WEEK",
        bars: [
          { label: "Direct", value: 2.8, color: "#4ade80" },
          { label: "Email", value: 4.2, color: "#4ade80" },
          { label: "Organic", value: 2.1, color: "#4fc3f7" },
          { label: "Paid", value: 0.4, color: "#fbbf24" },
        ],
        unit: "%",
        yMax: 5,
      },
      {
        type: "barHorizontal",
        title: "TOP 5 PRODUCTS BY UNITS SOLD — WTD",
        bars: [
          { label: "$24 Festival Tank", value: 2847, max: 3000 },
          { label: "$28 Festival Tee", value: 2180, max: 3000 },
          { label: "$48 Studio Joggers", value: 1205, max: 3000 },
          { label: "$98 Studio Hoodie", value: 412, max: 3000 },
          { label: "$148 Statement Coat", value: 168, max: 3000 },
        ],
      },
    ],
    questions: [
      {
        q: "In one sentence, what is the story this dashboard is telling?",
        gold: "Sessions are up but the wrong kind of traffic is driving the lift — paid social brought a 6x volume spike at 0.4% conversion (vs. 4.2% on email), and the products selling are the cheap ones, dragging AOV down. Net result: more visitors, less revenue.",
      },
      {
        q: "What is anomalous or unexpected in this data?",
        gold: "Paid social converts at 0.4% — roughly 1/10th the rate of email and 1/5th the rate of direct. That gap is too large to be normal channel variation; it suggests the campaign is targeting the wrong audience or sending traffic to a misaligned landing page. Also notable: the top 2 SKUs are both under $30, while the $98+ premium SKUs nearly disappeared from the top 5 — a mix shift that compounds the conversion problem.",
      },
      {
        q: "What would you ask next? Name the one piece of data you would pull before the meeting.",
        gold: "Pull the 14-day repeat purchase rate for first-time buyers acquired through Paid Social, segmented by what they bought. If those low-AOV festival tank buyers come back and purchase higher-margin items, the campaign is acquiring a real customer pipeline. If they don't, we're paying CAC for one-time discount hunters and the campaign should be cut or restructured.",
      },
    ],
  },
  {
    id: "healthcare-1",
    domain: "healthcare",
    title: "Q1 Inpatient Performance — Medical Surgical Unit",
    subtitle: "March 2026 vs. trailing 6-month average",
    scenario: "You are the analyst supporting the COO of a 280-bed community hospital. The CFO just received the Q1 financial close and is concerned about a margin compression on the Medical/Surgical service line. She's asked you to review this dashboard before tomorrow's executive meeting.",
    kpis: [
      { label: "ALOS (DAYS)", value: "5.8", delta: "▲ 0.7", up: false },
      { label: "READMIT RATE", value: "14.2%", delta: "▲ 2.1pp", up: false },
      { label: "BED OCCUPANCY", value: "92%", delta: "▲ 7pp", up: true },
      { label: "COST/DISCHARGE", value: "$11,840", delta: "▲ 9.1%", up: false },
    ],
    charts: [
      {
        type: "lineMulti",
        title: "MONTHLY ALOS BY DRG GROUP",
        series: [
          { label: "Cardiac", color: "#f87171", points: [42, 44, 43, 45, 48, 52] },
          { label: "Pulmonary", color: "#fbbf24", points: [38, 39, 38, 40, 41, 42] },
          { label: "Orthopedic", color: "#4ade80", points: [30, 31, 30, 30, 31, 31] },
        ],
        xLabels: ["Oct", "Nov", "Dec", "Jan", "Feb", "Mar"],
        yMax: 60,
        yUnit: "× 0.1 days",
      },
      {
        type: "barCategorical",
        title: "READMIT RATE BY PRIMARY PAYER — Q1",
        bars: [
          { label: "Medicare", value: 16.8, color: "#f87171" },
          { label: "Medicaid", value: 18.2, color: "#f87171" },
          { label: "Commercial", value: 9.4, color: "#4ade80" },
          { label: "Self-Pay", value: 12.1, color: "#fbbf24" },
        ],
        unit: "%",
        yMax: 22,
      },
      {
        type: "barHorizontal",
        title: "TOP 5 READMIT DIAGNOSES — Q1 BY VOLUME",
        bars: [
          { label: "CHF (heart failure)", value: 64, max: 80 },
          { label: "COPD exacerbation", value: 52, max: 80 },
          { label: "Pneumonia", value: 38, max: 80 },
          { label: "Sepsis", value: 31, max: 80 },
          { label: "Post-surgical infection", value: 24, max: 80 },
        ],
      },
    ],
    questions: [
      {
        q: "In one sentence, what is the story this dashboard is telling?",
        gold: "Cardiac patients are staying longer and coming back more often — driving ALOS up, readmit rate up, occupancy near saturation, and cost per discharge up — and it's concentrated in the Medicare/Medicaid CHF/COPD population, which is reimbursed at fixed rates that don't compensate for longer stays.",
      },
      {
        q: "What is anomalous or unexpected in this data?",
        gold: "The cardiac DRG line shows ALOS climbing from 4.2 to 5.2 days over six months — a 24% increase that the orthopedic line doesn't share. Combined with the 16.8% Medicare readmit rate (well above the CMS penalty threshold of ~15%), this isn't normal seasonal variation. The CHF/COPD readmits are the same population driving the cardiac ALOS, suggesting a discharge planning or transitions-of-care problem rather than acuity worsening.",
      },
      {
        q: "What would you ask next? Name the one piece of data you would pull before the meeting.",
        gold: "Pull the readmit cohort detail: of the 64 CHF readmits, how many had a documented post-discharge follow-up within 7 days, and how many had medication reconciliation completed at discharge? Both are evidence-based interventions that reduce CHF readmits. If those numbers are low, the fix is operational (care management staffing, follow-up scheduling), not clinical — which changes the recommendation entirely.",
      },
    ],
  },
  {
    id: "finance-1",
    domain: "finance",
    title: "Quarterly Revenue Review — SaaS Platform",
    subtitle: "Q1 2026 actuals vs. plan and prior-year",
    scenario: "You are the FP&A analyst at a B2B SaaS company preparing the board materials for the Q1 review. The CEO wants a one-page narrative on what's driving the gap between plan and actuals. You have 20 minutes before the materials are due.",
    kpis: [
      { label: "ARR", value: "$48.2M", delta: "▼ $1.8M vs plan", up: false },
      { label: "NRR", value: "108%", delta: "▼ 6pp YoY", up: false },
      { label: "GROSS MARGIN", value: "78%", delta: "▲ 2pp YoY", up: true },
      { label: "CAC PAYBACK", value: "22 mo", delta: "▲ 4 mo YoY", up: false },
    ],
    charts: [
      {
        type: "lineMulti",
        title: "QUARTERLY ARR — PLAN vs ACTUAL",
        series: [
          { label: "Plan", color: "#4fc3f7", points: [35, 40, 45, 50] },
          { label: "Actual", color: "#fbbf24", points: [35, 39, 44, 48.2] },
        ],
        xLabels: ["Q2 25", "Q3 25", "Q4 25", "Q1 26"],
        yMax: 55,
        yUnit: "$M",
      },
      {
        type: "barCategorical",
        title: "ARR MOVEMENT — Q1 26 ($M)",
        bars: [
          { label: "New", value: 4.8, color: "#4ade80" },
          { label: "Expand", value: 2.1, color: "#4ade80" },
          { label: "Contract", value: 2.9, color: "#f87171" },
          { label: "Churn", value: 5.8, color: "#f87171" },
        ],
        unit: "$M",
        yMax: 7,
      },
      {
        type: "barHorizontal",
        title: "CHURN BY CUSTOMER SEGMENT — Q1 26",
        bars: [
          { label: "SMB (<50 employees)", value: 52, max: 60 },
          { label: "Mid-Market (50-500)", value: 28, max: 60 },
          { label: "Enterprise (500+)", value: 8, max: 60 },
          { label: "Strategic (Top 20)", value: 2, max: 60 },
        ],
      },
    ],
    questions: [
      {
        q: "In one sentence, what is the story this dashboard is telling?",
        gold: "The business is healthy at the top of the funnel and in margin, but losing customers faster than it's adding them — specifically in the SMB segment, where churn alone ($5.8M) exceeded all new ARR ($4.8M) this quarter, dragging NRR to 108% and pushing CAC payback to 22 months.",
      },
      {
        q: "What is anomalous or unexpected in this data?",
        gold: "SMB accounts for 65% of churn (52 of 90 logos) but is unlikely to represent 65% of revenue — meaning the company is losing many small customers cheaply, but the operational drag (support, onboarding cost amortized over short tenure) is real. Also unusual: gross margin actually improved 2pp YoY, ruling out a unit-economics problem in delivery. The issue is acquisition mismatched to retention — we're adding the wrong customers.",
      },
      {
        q: "What would you ask next? Name the one piece of data you would pull before the meeting.",
        gold: "Pull SMB cohort retention curves by acquisition channel for the past 8 quarters, with marketing spend by channel layered in. If SMB customers from one specific channel (e.g., paid search) churn 2-3x faster than SMB customers from another channel (e.g., partner referral), the recommendation writes itself: cut spend on the bad-fit channel and reallocate to mid-market acquisition where retention is durable.",
      },
    ],
  },
  {
    id: "operations-1",
    domain: "operations",
    title: "Distribution Center Performance — DC West",
    subtitle: "Week 17 of 2026, vs. trailing 8-week average",
    scenario: "You are the operations analyst for a national retailer's supply chain team. DC West has been flagged in the weekly ops call for two consecutive weeks. The VP of Distribution wants a root cause analysis before the Friday ops meeting.",
    kpis: [
      { label: "ON-TIME DELIVERY", value: "87.4%", delta: "▼ 6.2pp", up: false },
      { label: "ORDER FILL RATE", value: "94.1%", delta: "▼ 3.8pp", up: false },
      { label: "PICK ACCURACY", value: "99.1%", delta: "—", up: true },
      { label: "COST/ORDER", value: "$8.42", delta: "▲ 11.4%", up: false },
    ],
    charts: [
      {
        type: "lineMulti",
        title: "WEEKLY OTD% — DC WEST vs NETWORK AVG",
        series: [
          { label: "Network Avg", color: "#4ade80", points: [93, 93, 94, 93, 94, 93, 94, 94] },
          { label: "DC West", color: "#f87171", points: [93, 93, 94, 92, 92, 90, 88, 87] },
        ],
        xLabels: ["W10", "W11", "W12", "W13", "W14", "W15", "W16", "W17"],
        yMax: 100,
        yUnit: "%",
      },
      {
        type: "barCategorical",
        title: "DC WEST LATE-DELIVERY ROOT CAUSE — W17",
        bars: [
          { label: "Stock-out", value: 42, color: "#f87171" },
          { label: "Carrier delay", value: 18, color: "#fbbf24" },
          { label: "Pick error", value: 4, color: "#4ade80" },
          { label: "System down", value: 36, color: "#f87171" },
        ],
        unit: "%",
        yMax: 50,
      },
      {
        type: "barHorizontal",
        title: "TOP 5 STOCK-OUT SKUS — W17 BY UNITS BACKORDERED",
        bars: [
          { label: "Cleaning supplies bundle", value: 1840, max: 2000 },
          { label: "Paper towels case", value: 1520, max: 2000 },
          { label: "Spring décor set", value: 980, max: 2000 },
          { label: "Trash bags 200ct", value: 720, max: 2000 },
          { label: "Air freshener 6pk", value: 510, max: 2000 },
        ],
      },
    ],
    questions: [
      {
        q: "In one sentence, what is the story this dashboard is telling?",
        gold: "DC West's OTD has decoupled from the network — the gap opened in W14 and is widening, driven primarily by stock-outs on high-velocity household consumables (78% of late deliveries are stock-out or system-related, only 4% are pick errors), suggesting an upstream replenishment or forecasting problem, not a warehouse operations problem.",
      },
      {
        q: "What is anomalous or unexpected in this data?",
        gold: "Pick accuracy is at 99.1% with no degradation — that rules out a labor or training issue at the DC. The problem is upstream: the stock-out and system-down categories together account for 78% of late deliveries, both of which point to inventory positioning or IT, not floor execution. Also notable: every top stock-out SKU is a low-margin, high-velocity household staple — meaning the financial impact is mostly in customer experience and OTD penalty, not lost margin.",
      },
      {
        q: "What would you ask next? Name the one piece of data you would pull before the meeting.",
        gold: "Pull the inventory replenishment lead times and reorder point trigger history for the top 5 stock-out SKUs over the past 90 days, segmented by supplier. If lead times have lengthened (supplier issue) or the reorder triggers haven't fired (system issue), the fix is at the planning system or supplier level — both of which are outside the DC's direct control. That changes the meeting from 'what is DC West doing wrong' to 'where in the supply chain is the actual constraint.'",
      },
    ],
  },
  {
    id: "marketing-1",
    domain: "marketing",
    title: "Q1 Paid Acquisition Performance",
    subtitle: "Q1 2026 actuals vs. plan",
    scenario: "You are the marketing analyst at a DTC consumer brand. The new VP of Marketing started two weeks ago and is reviewing channel performance. He's preparing to present a 2026 budget reallocation to the CEO and asked you to walk him through this dashboard before he meets with the agency.",
    kpis: [
      { label: "TOTAL SPEND", value: "$2.4M", delta: "▲ 8% vs plan", up: false },
      { label: "BLENDED ROAS", value: "2.1×", delta: "▼ 0.4× vs plan", up: false },
      { label: "NEW CUSTOMERS", value: "18,420", delta: "▲ 4% vs plan", up: true },
      { label: "BLENDED CAC", value: "$130", delta: "▲ $24 vs plan", up: false },
    ],
    charts: [
      {
        type: "lineMulti",
        title: "MONTHLY ROAS — Q1 BY CHANNEL",
        series: [
          { label: "Email/CRM", color: "#4ade80", points: [80, 82, 78] },
          { label: "Paid Search", color: "#4fc3f7", points: [50, 48, 44] },
          { label: "Paid Social", color: "#fbbf24", points: [22, 18, 14] },
        ],
        xLabels: ["Jan", "Feb", "Mar"],
        yMax: 100,
        yUnit: "× 0.1×",
      },
      {
        type: "barCategorical",
        title: "Q1 SPEND ALLOCATION BY CHANNEL ($K)",
        bars: [
          { label: "Paid Social", value: 1240, color: "#fbbf24" },
          { label: "Paid Search", value: 720, color: "#4fc3f7" },
          { label: "Email/CRM", value: 180, color: "#4ade80" },
          { label: "Influencer", value: 260, color: "#c084fc" },
        ],
        unit: "$K",
        yMax: 1400,
      },
      {
        type: "barHorizontal",
        title: "Q1 NEW-CUSTOMER LTV (90-DAY) BY CHANNEL",
        bars: [
          { label: "Email/CRM", value: 184, max: 200 },
          { label: "Paid Search", value: 142, max: 200 },
          { label: "Influencer", value: 128, max: 200 },
          { label: "Paid Social", value: 62, max: 200 },
        ],
      },
    ],
    questions: [
      {
        q: "In one sentence, what is the story this dashboard is telling?",
        gold: "More than half the marketing budget is going to the worst-performing channel — Paid Social at $1.24M is 52% of spend, generating 1.4× ROAS and acquiring customers worth less than half the email customers, while Email/CRM with the highest ROAS and highest LTV gets only 8% of the budget.",
      },
      {
        q: "What is anomalous or unexpected in this data?",
        gold: "ROAS isn't just low on Paid Social — it's deteriorating, dropping from 2.2× to 1.4× over Q1 while every other channel held steady or grew. Combined with the 90-day LTV gap (Email customers worth $184 vs. Paid Social customers worth $62), this is not a campaign optimization issue — it's an audience quality issue. Paid Social is acquiring a structurally different (and worse) customer cohort.",
      },
      {
        q: "What would you ask next? Name the one piece of data you would pull before the meeting.",
        gold: "Pull the Paid Social customer cohort breakdown by promo code usage and first-purchase product. The hypothesis: Paid Social is attracting deal-seekers who only buy on a discount and never come back. If 70%+ of Paid Social acquisitions used a promo and bought only the cheapest SKU, the recommendation is to cut Paid Social spend by 50%+ and reallocate to Email/CRM expansion and Paid Search scale, not to optimize the existing Paid Social campaigns.",
      },
    ],
  },
// ── MODE 2 v2: ADDITIONAL DASHBOARD DRILLS (20 new, 4 per domain) ──────────
// Append these to the DASHBOARD_DRILLS array in intel_modes_2_3.jsx
// Each drill tells a different story from the existing 5

// RETAIL: drills 2-5
  {
    id: "retail-2",
    domain: "retail",
    title: "End-of-Season Inventory Review — Fall Collection",
    subtitle: "Week 14 of 16-week selling season",
    scenario: "You are the merchandising analyst at a mid-market apparel brand. The Fall collection entered its final two weeks of full-price selling. The planning team needs your read on which categories to markdown now vs. hold, and whether to pull forward the Spring receipt schedule.",
    kpis: [
      { label: "SELL-THROUGH (SEASON)", value: "61%", delta: "▼ 11pp vs plan", up: false },
      { label: "INVENTORY ON HAND", value: "$4.2M", delta: "▲ 28% vs plan", up: false },
      { label: "FULL-PRICE SALES MIX", value: "74%", delta: "▼ 8pp YoY", up: false },
      { label: "WEEKS OF SUPPLY", value: "6.4 wks", delta: "▲ 2.1 wks vs plan", up: false },
    ],
    charts: [
      {
        type: "barCategorical",
        title: "SELL-THROUGH BY CATEGORY — SEASON TO DATE",
        bars: [
          { label: "Outerwear", value: 82, color: "#4ade80" },
          { label: "Knitwear", value: 74, color: "#4ade80" },
          { label: "Denim", value: 58, color: "#fbbf24" },
          { label: "Accessories", value: 49, color: "#f87171" },
          { label: "Dresses", value: 38, color: "#f87171" },
        ],
        unit: "%",
        yMax: 100,
      },
      {
        type: "lineMulti",
        title: "WEEKLY SELL-THROUGH PACE — ACTUAL VS PLAN",
        series: [
          { label: "Plan", color: "#4fc3f7", points: [8, 9, 10, 10, 9, 8, 7, 7, 6, 6, 5, 5, 4, 4] },
          { label: "Actual", color: "#f87171", points: [9, 10, 9, 8, 7, 6, 5, 4, 4, 4, 3, 3, 3, null] },
        ],
        xLabels: ["W1", "W2", "W3", "W4", "W5", "W6", "W7", "W8", "W9", "W10", "W11", "W12", "W13", "W14"],
        yMax: 12,
        yUnit: "% ST/wk",
      },
      {
        type: "barHorizontal",
        title: "EXCESS INVENTORY BY CATEGORY ($K)",
        bars: [
          { label: "Dresses", value: 1840, max: 2000 },
          { label: "Accessories", value: 1120, max: 2000 },
          { label: "Denim", value: 820, max: 2000 },
          { label: "Knitwear", value: 310, max: 2000 },
          { label: "Outerwear", value: 110, max: 2000 },
        ],
      },
    ],
    questions: [
      {
        q: "In one sentence, what is the story this dashboard is telling?",
        gold: "Two categories (Dresses and Accessories) are sitting on $3M of excess inventory with 6+ weeks of supply and decelerating weekly pace — with only 2 weeks of full-price selling left, these categories need an immediate markdown decision or they'll clear at deeply discounted rates in the season-end liquidation window.",
      },
      {
        q: "What is anomalous or unexpected in this data?",
        gold: "Outerwear and Knitwear are selling through at 82% and 74% with minimal excess — far above the blended average and almost certainly already sold through to near-terminal depth. Dresses at 38% sell-through in week 14 of 16 is the real outlier — weekly pace has decelerated to 3% per week, meaning at current velocity they'd need 20+ weeks to clear, which is structurally impossible. The gap between the best and worst performing categories (44pp) suggests an assortment selection problem, not a demand environment problem.",
      },
      {
        q: "What would you ask next? Name the one piece of data you would pull before the meeting.",
        gold: "Pull the price sensitivity curve for Dresses from last season's markdown cadence — specifically, what discount depth triggered a meaningful sell-through acceleration and at what markdown timing. If 30% off in week 14 drove 8% weekly sell-through last year, we have a defensible markdown recommendation for this week's meeting. Without the prior-year markdown response curve, any markdown recommendation is a guess.",
      },
    ],
  },
  {
    id: "retail-3",
    domain: "retail",
    title: "Email Program Performance — Q1 Review",
    subtitle: "Q1 2026 vs Q1 2025",
    scenario: "You are the CRM analyst preparing the quarterly email performance review for the VP of Marketing. Email drives 34% of total revenue. The VP has noticed that revenue per send is declining and wants a root cause before the Q2 budget discussion.",
    kpis: [
      { label: "LIST SIZE", value: "1.42M", delta: "▲ 31% YoY", up: true },
      { label: "AVG OPEN RATE", value: "19.4%", delta: "▼ 10.8pp YoY", up: false },
      { label: "CLICK RATE", value: "1.8%", delta: "▼ 1.2pp YoY", up: false },
      { label: "REVENUE PER SEND", value: "$0.38", delta: "▼ $0.21 YoY", up: false },
    ],
    charts: [
      {
        type: "lineMulti",
        title: "OPEN RATE TREND — MONTHLY (LAST 12 MONTHS)",
        series: [
          { label: "Open Rate", color: "#f87171", points: [31, 30, 29, 28, 26, 25, 24, 22, 21, 20, 20, 19] },
          { label: "List Size (×100K)", color: "#4fc3f7", points: [10.8, 11.0, 11.2, 11.5, 11.8, 12.0, 12.4, 12.8, 13.2, 13.6, 14.0, 14.2] },
        ],
        xLabels: ["Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar"],
        yMax: 35,
      },
      {
        type: "barCategorical",
        title: "OPEN RATE BY ACQUISITION SOURCE — Q1 2026",
        bars: [
          { label: "Organic/Direct", value: 31.2, color: "#4ade80" },
          { label: "Referral", value: 28.4, color: "#4ade80" },
          { label: "Content DL", value: 24.8, color: "#4fc3f7" },
          { label: "Pop-up Modal", value: 12.1, color: "#f87171" },
          { label: "Lead Magnet", value: 9.8, color: "#f87171" },
        ],
        unit: "%",
        yMax: 35,
      },
      {
        type: "barHorizontal",
        title: "SUBSCRIBERS BY ACQUISITION SOURCE (000s)",
        bars: [
          { label: "Pop-up Modal", value: 580, max: 600 },
          { label: "Lead Magnet", value: 310, max: 600 },
          { label: "Content Download", value: 280, max: 600 },
          { label: "Organic/Direct", value: 160, max: 600 },
          { label: "Referral", value: 90, max: 600 },
        ],
      },
    ],
    questions: [
      {
        q: "In one sentence, what is the story this dashboard is telling?",
        gold: "The list grew 31% by aggressively acquiring low-quality subscribers via pop-up modals and lead magnets, which open at 10-12% vs 28-31% for organic subscribers — and since modal/lead magnet sources now represent 62% of the list, they're dragging the blended open rate down and making the channel look broken when the underlying high-quality list is still performing well.",
      },
      {
        q: "What is anomalous or unexpected in this data?",
        gold: "The inverse relationship between list size and open rate is the signal: as list size grew, open rate declined at almost exactly the pace you'd predict if the new subscribers are performing at 10-12% vs the existing base at 30%+. This isn't deliverability degradation or Apple Mail Privacy Protection distortion — it's a list-mix math problem. The best subscribers (organic, referral) are a shrinking percentage of an inflating denominator.",
      },
      {
        q: "What would you ask next? Name the one piece of data you would pull before the meeting.",
        gold: "Pull revenue per email sent segmented by acquisition source — specifically, the LTV-to-date for pop-up modal and lead magnet subscribers acquired in the last 12 months compared to organic subscribers from the same period. If modal subscribers generate $0.12 per send vs organic's $0.58 per send, the case for pausing modal acquisition and implementing a sunset policy for disengaged subscribers writes itself in revenue terms, not just engagement terms.",
      },
    ],
  },
  {
    id: "retail-4",
    domain: "retail",
    title: "New Product Launch Tracker — Spring Footwear",
    subtitle: "Weeks 1-6 post-launch",
    scenario: "You are the analytics lead for a specialty footwear brand. The Spring 2026 collection launched 6 weeks ago. The product team wants your assessment before deciding whether to reorder the top styles, markdown the underperformers, or pull a style entirely.",
    kpis: [
      { label: "BLENDED SELL-THROUGH", value: "44%", delta: "▼ 6pp vs prior launch", up: false },
      { label: "RETURN RATE", value: "22%", delta: "▲ 8pp vs prior launch", up: false },
      { label: "AVG REVIEW SCORE", value: "3.8 / 5", delta: "▼ 0.6 vs prior launch", up: false },
      { label: "REORDER ELIGIBLE STYLES", value: "3 of 12", delta: "Prior launch: 7 of 11", up: false },
    ],
    charts: [
      {
        type: "barCategorical",
        title: "SELL-THROUGH BY STYLE — WEEK 6",
        bars: [
          { label: "Canvas Low", value: 78, color: "#4ade80" },
          { label: "Leather Mid", value: 71, color: "#4ade80" },
          { label: "Sport Slide", value: 62, color: "#4ade80" },
          { label: "Woven Flat", value: 41, color: "#fbbf24" },
          { label: "Platform Clog", value: 28, color: "#f87171" },
          { label: "Strappy Heel", value: 19, color: "#f87171" },
        ],
        unit: "%",
        yMax: 100,
      },
      {
        type: "barCategorical",
        title: "RETURN RATE BY STYLE — WEEK 6",
        bars: [
          { label: "Canvas Low", value: 8, color: "#4ade80" },
          { label: "Leather Mid", value: 11, color: "#4ade80" },
          { label: "Sport Slide", value: 9, color: "#4ade80" },
          { label: "Woven Flat", value: 24, color: "#fbbf24" },
          { label: "Platform Clog", value: 38, color: "#f87171" },
          { label: "Strappy Heel", value: 41, color: "#f87171" },
        ],
        unit: "%",
        yMax: 50,
      },
      {
        type: "barHorizontal",
        title: "REVIEW THEMES — PLATFORM CLOG + STRAPPY HEEL (TOP COMPLAINTS)",
        bars: [
          { label: "Runs small / sizing off", value: 148, max: 160 },
          { label: "Uncomfortable / poor support", value: 124, max: 160 },
          { label: "Not as pictured", value: 98, max: 160 },
          { label: "Quality/materials", value: 61, max: 160 },
          { label: "Shipping damage", value: 18, max: 160 },
        ],
      },
    ],
    questions: [
      {
        q: "In one sentence, what is the story this dashboard is telling?",
        gold: "The launch has a clean split: three styles (Canvas Low, Leather Mid, Sport Slide) are performing at or above prior launch benchmarks with low returns and strong sell-through, while two styles (Platform Clog, Strappy Heel) are failing on every dimension — low sell-through, 38-41% return rates, and review themes pointing to sizing problems and product-page misrepresentation.",
      },
      {
        q: "What is anomalous or unexpected in this data?",
        gold: "A 38-41% return rate is 4-5× the healthy benchmark for footwear and cannot be explained by demand softness — the Canvas Low and Leather Mid prove the category is working. The combination of 'runs small' and 'not as pictured' reviews on the Platform Clog and Strappy Heel together suggest two distinct problems: a sizing/last issue with the physical product, and a photography/description disconnect on the product page. Both need separate fixes.",
      },
      {
        q: "What would you ask next? Name the one piece of data you would pull before the meeting.",
        gold: "Pull the size distribution of Platform Clog and Strappy Heel returns vs orders — specifically, whether returns skew toward customers who ordered their normal size vs sized up or down. If 70%+ of returns come from customers who ordered their normal size and returned because it was too small, the fix is a product page sizing callout ('runs small, size up'), which is a 24-hour change. If returns are distributed evenly across sizes, the problem is in the last itself and requires a vendor conversation.",
      },
    ],
  },
  {
    id: "retail-5",
    domain: "retail",
    title: "Subscription Box Monthly Cohort Review",
    subtitle: "March 2026 cohorts vs trailing 6-month average",
    scenario: "You are the analyst for a DTC subscription box service (home goods, $48/month). The Head of Retention is reviewing March acquisition cohorts and pause/cancel behavior before the Q2 retention budget meeting.",
    kpis: [
      { label: "NEW SUBSCRIBERS (MAR)", value: "4,820", delta: "▲ 22% MoM", up: true },
      { label: "30-DAY RETENTION", value: "71%", delta: "▼ 9pp vs avg", up: false },
      { label: "PAUSE RATE (DAY 30)", value: "18%", delta: "▲ 6pp vs avg", up: false },
      { label: "LTV (PROJECTED 12-MO)", value: "$188", delta: "▼ $41 vs avg", up: false },
    ],
    charts: [
      {
        type: "lineMulti",
        title: "30-DAY RETENTION BY ACQUISITION COHORT",
        series: [
          { label: "Oct cohort", color: "#4ade80", points: [100, 82, 80, 79, 78] },
          { label: "Jan cohort", color: "#4fc3f7", points: [100, 80, 78, 77, 76] },
          { label: "Mar cohort", color: "#f87171", points: [100, 71, 68, null, null] },
        ],
        xLabels: ["Day 0", "Day 30", "Day 60", "Day 90", "Day 120"],
        yMax: 100,
        yUnit: "% retained",
      },
      {
        type: "barCategorical",
        title: "MARCH COHORT — ACQUISITION CHANNEL MIX",
        bars: [
          { label: "Paid Social", value: 58, color: "#fbbf24" },
          { label: "Influencer", value: 22, color: "#4fc3f7" },
          { label: "Organic/SEO", value: 12, color: "#4ade80" },
          { label: "Referral", value: 8, color: "#4ade80" },
        ],
        unit: "%",
        yMax: 70,
      },
      {
        type: "barHorizontal",
        title: "CANCEL/PAUSE REASON — MARCH COHORT DAY 30",
        bars: [
          { label: "Too expensive", value: 38, max: 50 },
          { label: "Didn't like the items", value: 31, max: 50 },
          { label: "Already have too much", value: 18, max: 50 },
          { label: "Gifted / one-time", value: 9, max: 50 },
          { label: "Quality issue", value: 4, max: 50 },
        ],
      },
    ],
    questions: [
      {
        q: "In one sentence, what is the story this dashboard is telling?",
        gold: "March's volume growth came from a channel mix shift toward paid social (58% of acquisition vs historical ~30%) that's importing structurally worse subscribers — the cohort's 30-day retention is 9pp below average, pause rate is 6pp above, and 'too expensive' as the top cancel reason suggests discount-acquired subscribers who didn't value the product at full price.",
      },
      {
        q: "What is anomalous or unexpected in this data?",
        gold: "The March cohort's 30-day drop to 71% is unusually sharp — prior cohorts held 80%+ through day 30. Combined with paid social being 58% of acquisition vs historical ~30% and 'too expensive' being the top cancel reason (not 'didn't like items'), this strongly suggests the paid social campaigns are using heavy discount offers to drive trial from price-sensitive subscribers who have no intention of continuing at $48/month. The influencer channel at 22% is worth isolating — if those subscribers retain at 80%+, the problem is paid social specifically, not the March product mix.",
      },
      {
        q: "What would you ask next? Name the one piece of data you would pull before the meeting.",
        gold: "Pull 30-day retention segmented by acquisition channel within the March cohort — specifically paid social vs influencer vs organic. If organic and referral subscribers are retaining at 79%+ and paid social subscribers are retaining at 62%, the budget reallocation recommendation is straightforward and the data is unambiguous. If all channels are retaining poorly, the problem is the March box curation itself.",
      },
    ],
  },

// HEALTHCARE: drills 2-5
  {
    id: "healthcare-2",
    domain: "healthcare",
    title: "Revenue Cycle Performance Dashboard",
    subtitle: "Q1 2026 vs trailing 4-quarter average",
    scenario: "You are the revenue cycle analyst at a multi-specialty physician group. The CFO has flagged that cash collections are running below budget for the third consecutive month. She needs your read on root cause before the board meeting next week.",
    kpis: [
      { label: "DAYS IN AR", value: "54.2", delta: "▲ 14.8 days", up: false },
      { label: "CLEAN CLAIM RATE", value: "87.4%", delta: "▼ 6.2pp", up: false },
      { label: "INITIAL DENIAL RATE", value: "14.8%", delta: "▲ 5.1pp", up: false },
      { label: "NET COLLECTION RATE", value: "93.1%", delta: "▼ 3.8pp", up: false },
    ],
    charts: [
      {
        type: "lineMulti",
        title: "DENIAL RATE BY PAYER — QUARTERLY TREND",
        series: [
          { label: "Medicare", color: "#4ade80", points: [8.2, 8.4, 8.1, 8.3] },
          { label: "Medicaid", color: "#4fc3f7", points: [11.2, 11.8, 12.1, 12.4] },
          { label: "Blue Cross", color: "#fbbf24", points: [9.1, 18.2, 26.4, 31.8] },
          { label: "Aetna", color: "#f87171", points: [8.8, 9.1, 9.4, 9.2] },
        ],
        xLabels: ["Q2 25", "Q3 25", "Q4 25", "Q1 26"],
        yMax: 35,
        yUnit: "%",
      },
      {
        type: "barCategorical",
        title: "DENIAL REASON CODES — Q1 2026 (% of DENIALS)",
        bars: [
          { label: "Prior Auth Missing", value: 42, color: "#f87171" },
          { label: "Eligibility Error", value: 28, color: "#fbbf24" },
          { label: "Coding Error", value: 18, color: "#fbbf24" },
          { label: "Timely Filing", value: 8, color: "#4fc3f7" },
          { label: "Other", value: 4, color: "#4ade80" },
        ],
        unit: "%",
        yMax: 50,
      },
      {
        type: "barHorizontal",
        title: "AR AGING BUCKETS — CURRENT ($K)",
        bars: [
          { label: "0-30 days", value: 1840, max: 2000 },
          { label: "31-60 days", value: 980, max: 2000 },
          { label: "61-90 days", value: 620, max: 2000 },
          { label: "91-120 days", value: 480, max: 2000 },
          { label: "120+ days", value: 1240, max: 2000 },
        ],
      },
    ],
    questions: [
      {
        q: "In one sentence, what is the story this dashboard is telling?",
        gold: "One payer — Blue Cross — has driven denial rates from 9% to 32% over four quarters, and the primary denial reason (42% of all denials are prior auth missing) points to a policy change on Blue Cross's end that our authorization workflow hasn't caught up to, creating an AR pile-up that's now showing in the 120+ day aging bucket.",
      },
      {
        q: "What is anomalous or unexpected in this data?",
        gold: "The Blue Cross denial rate trajectory — 9.1% to 31.8% in four quarters — is not a drift, it's a structural break. Medicare, Aetna, and even Medicaid are stable or slightly moving, which rules out an internal coding or staffing problem. A 3.5× denial rate increase at one payer in 12 months almost always traces to a policy change (new prior authorization requirements, formulary change, network contract modification) rather than anything we did. The 120+ day AR bucket at $1.24M is the financial consequence — those are Blue Cross claims sitting in denial/appeal limbo.",
      },
      {
        q: "What would you ask next? Name the one piece of data you would pull before the meeting.",
        gold: "Pull the Blue Cross denial list segmented by procedure code and service date — specifically looking for which procedure codes started getting denied and when exactly the first spike occurred. If denials are concentrated on specific CPT codes that changed prior auth requirements after a specific date, we have a clear before/after and a specific authorization workflow gap to fix. That also gives us the basis for a payer relations conversation and potentially a retro-authorization request for the claims already denied.",
      },
    ],
  },
  {
    id: "healthcare-3",
    domain: "healthcare",
    title: "OR Utilization Dashboard — Q1 2026",
    subtitle: "14-surgeon surgical service line",
    scenario: "You are the surgical analytics lead. OR utilization has been below the 80% target for three consecutive quarters. The COO has asked for a root cause analysis before the surgical services committee meeting.",
    kpis: [
      { label: "OR UTILIZATION", value: "62%", delta: "▼ 18pp vs target", up: false },
      { label: "FIRST-CASE ON-TIME START", value: "68%", delta: "▼ 14pp vs target", up: false },
      { label: "AVG TURNOVER TIME", value: "38 min", delta: "▲ 11 min vs target", up: false },
      { label: "CASE CANCELLATION RATE", value: "8.2%", delta: "▲ 3.1pp YoY", up: false },
    ],
    charts: [
      {
        type: "barCategorical",
        title: "BLOCK UTILIZATION BY SURGEON — Q1 2026 (%)",
        bars: [
          { label: "Surgeon A", value: 94, color: "#4ade80" },
          { label: "Surgeon B", value: 91, color: "#4ade80" },
          { label: "Surgeon C", value: 88, color: "#4ade80" },
          { label: "Surgeon D", value: 82, color: "#4ade80" },
          { label: "Surgeon E", value: 71, color: "#fbbf24" },
          { label: "Surgeon F", value: 34, color: "#f87171" },
          { label: "Surgeon G", value: 28, color: "#f87171" },
        ],
        unit: "%",
        yMax: 100,
      },
      {
        type: "barCategorical",
        title: "CASE CANCELLATION REASONS — Q1 2026 (%)",
        bars: [
          { label: "Patient medical", value: 38, color: "#4fc3f7" },
          { label: "Patient no-show", value: 28, color: "#fbbf24" },
          { label: "Instrument unavail.", value: 22, color: "#f87171" },
          { label: "Surgeon unavail.", value: 8, color: "#fbbf24" },
          { label: "Scheduling error", value: 4, color: "#4ade80" },
        ],
        unit: "%",
        yMax: 45,
      },
      {
        type: "barHorizontal",
        title: "FIRST-CASE DELAY REASONS — Q1 2026 (MINUTES LOST)",
        bars: [
          { label: "Patient late to pre-op", value: 142, max: 160 },
          { label: "Consent not complete", value: 118, max: 160 },
          { label: "Anesthesia not ready", value: 94, max: 160 },
          { label: "Instrument setup", value: 72, max: 160 },
          { label: "Surgeon late", value: 48, max: 160 },
        ],
      },
    ],
    questions: [
      {
        q: "In one sentence, what is the story this dashboard is telling?",
        gold: "OR utilization is failing at three distinct points simultaneously: block allocation (two surgeons at 28-34% utilization are holding blocks that high-utilization surgeons need), first-case start (patient pre-op readiness and consent completion are the top delay drivers), and instrument availability (22% of cancellations are from instruments not being ready), each of which has a different fix.",
      },
      {
        q: "What is anomalous or unexpected in this data?",
        gold: "Surgeon F and G at 28-34% block utilization stand out — they're holding reserved OR time they aren't filling, which alone could account for 6-8pp of the utilization gap. But the more operationally interesting finding is that instrument unavailability drives 22% of cancellations: this isn't a surgeon or patient problem, it's a sterile processing or supply chain problem that cancels cases that were otherwise ready to proceed. At 8.2% total cancellation rate, instrument-related cancellations represent roughly 1.8% of all cases — a fixable process failure with immediate utilization impact.",
      },
      {
        q: "What would you ask next? Name the one piece of data you would pull before the meeting.",
        gold: "Pull the block schedule for Surgeons F and G for the next 8 weeks alongside the add-on case request log for Surgeons A-D. If A-D have a backlog of add-on requests that are being denied because F and G's blocks are technically reserved, the reallocation case is immediate and data-supported. Implementing a 72-hour automatic block release rule for blocks not filled to 80% would free up capacity without requiring a permanent reallocation conversation.",
      },
    ],
  },
  {
    id: "healthcare-4",
    domain: "healthcare",
    title: "Population Health Quality Dashboard — Medicare Advantage",
    subtitle: "Q1 2026 vs Star Rating targets",
    scenario: "You are the population health analyst at a Medicare Advantage plan. The plan's Star Rating dropped from 4.0 to 3.5 last cycle. The Medical Director needs to identify which quality measures to prioritize for the Q2 intervention push.",
    kpis: [
      { label: "COMPOSITE STAR SCORE", value: "3.5 ★", delta: "▼ 0.5 vs prior year", up: false },
      { label: "HEDIS MEASURES AT TARGET", value: "6 of 14", delta: "Prior year: 10 of 14", up: false },
      { label: "CARE GAP CLOSURE RATE", value: "41%", delta: "▼ 12pp vs target", up: false },
      { label: "MEMBER SATISFACTION (CAHPS)", value: "76%", delta: "▼ 4pp vs prior year", up: false },
    ],
    charts: [
      {
        type: "barCategorical",
        title: "HEDIS MEASURE PERFORMANCE VS THRESHOLD (%)",
        bars: [
          { label: "Colorectal Screen", value: 71, color: "#4ade80" },
          { label: "A1c Control (<8)", value: 68, color: "#4ade80" },
          { label: "Med Adherence–Statins", value: 82, color: "#4ade80" },
          { label: "Breast Cancer Screen", value: 58, color: "#fbbf24" },
          { label: "BP Control (<140/90)", value: 54, color: "#f87171" },
          { label: "Med Adherence–Diabetes", value: 61, color: "#fbbf24" },
        ],
        unit: "%",
        yMax: 100,
      },
      {
        type: "lineMulti",
        title: "CARE GAP CLOSURE RATE — MONTHLY",
        series: [
          { label: "Target", color: "#4ade80", points: [53, 53, 53, 53, 53, 53] },
          { label: "Actual", color: "#f87171", points: [48, 46, 44, 42, 41, 41] },
        ],
        xLabels: ["Oct", "Nov", "Dec", "Jan", "Feb", "Mar"],
        yMax: 60,
        yUnit: "%",
      },
      {
        type: "barHorizontal",
        title: "OPEN CARE GAPS BY MEASURE — TOP 5 (MEMBER COUNT)",
        bars: [
          { label: "BP Control", value: 4820, max: 5500 },
          { label: "Breast Cancer Screen", value: 3940, max: 5500 },
          { label: "Med Adherence–Diabetes", value: 3210, max: 5500 },
          { label: "A1c Testing", value: 2180, max: 5500 },
          { label: "Colorectal Screen", value: 1640, max: 5500 },
        ],
      },
    ],
    questions: [
      {
        q: "In one sentence, what is the story this dashboard is telling?",
        gold: "BP Control has the largest open gap population (4,820 members below threshold) and is a triple-weighted Star measure, making it the highest-leverage single intervention — but care gap closure rate has been declining for 6 consecutive months, suggesting the outreach infrastructure itself is broken, not just the individual measure performance.",
      },
      {
        q: "What is anomalous or unexpected in this data?",
        gold: "Medication Adherence for statins is at 82% — above threshold — while Medication Adherence for Diabetes medications is at 61% — below threshold. Both are adherence measures, same basic intervention model (pharmacy outreach, auto-refill enrollment, blister packs), but dramatically different performance. This gap suggests either the diabetes adherence program isn't running at the same intensity as the statin program, or that the diabetes medication population has structural barriers (cost, side effects, insulin complexity) that demand a different intervention approach.",
      },
      {
        q: "What would you ask next? Name the one piece of data you would pull before the meeting.",
        gold: "Pull the outreach attempt rate and response rate for the BP Control care gap population segmented by provider group — specifically comparing which primary care groups have high care gap closure rates vs which groups have low rates for the same member population. If two provider groups account for 60% of open BP gaps, targeted provider engagement with those specific groups (and their EMR-integrated care gap alerts) will move the measure more efficiently than a broad member-level outreach campaign.",
      },
    ],
  },
  {
    id: "healthcare-5",
    domain: "healthcare",
    title: "ED Throughput & Patient Experience Dashboard",
    subtitle: "March 2026 vs 6-month trailing average",
    scenario: "You are the ED analytics lead. Patient experience scores have been declining for three months and the CNO wants to understand whether it's a throughput problem, a staffing problem, or something else before restructuring the ED nursing model.",
    kpis: [
      { label: "DOOR-TO-PROVIDER (MIN)", value: "48 min", delta: "▲ 22 min vs avg", up: false },
      { label: "HCAHPS ED SCORE", value: "68th pctile", delta: "▼ 14 pctile pts", up: false },
      { label: "LWBS RATE", value: "4.2%", delta: "▲ 2.8pp vs avg", up: false },
      { label: "ED VOLUME (DAILY AVG)", value: "142 visits", delta: "▲ 18% vs avg", up: false },
    ],
    charts: [
      {
        type: "lineMulti",
        title: "DOOR-TO-PROVIDER TIME BY SHIFT (MINUTES)",
        series: [
          { label: "Day (7a-3p)", color: "#4ade80", points: [28, 29, 30, 32, 34, 36] },
          { label: "Evening (3p-11p)", color: "#fbbf24", points: [32, 36, 41, 48, 54, 58] },
          { label: "Night (11p-7a)", color: "#f87171", points: [26, 27, 28, 30, 31, 32] },
        ],
        xLabels: ["Oct", "Nov", "Dec", "Jan", "Feb", "Mar"],
        yMax: 65,
        yUnit: "min",
      },
      {
        type: "barCategorical",
        title: "HCAHPS DOMAIN SCORES — MARCH vs BENCHMARK (%)",
        bars: [
          { label: "Communication", value: 74, color: "#4ade80" },
          { label: "Pain Management", value: 71, color: "#4ade80" },
          { label: "Responsiveness", value: 48, color: "#f87171" },
          { label: "Quietness", value: 62, color: "#fbbf24" },
          { label: "Overall Rating", value: 58, color: "#f87171" },
        ],
        unit: "%",
        yMax: 100,
      },
      {
        type: "barHorizontal",
        title: "LWBS RATE BY HOUR OF DAY — MARCH (%)",
        bars: [
          { label: "3pm-7pm", value: 7.8, max: 10 },
          { label: "7pm-11pm", value: 6.4, max: 10 },
          { label: "11am-3pm", value: 3.2, max: 10 },
          { label: "7am-11am", value: 1.8, max: 10 },
          { label: "11pm-7am", value: 0.9, max: 10 },
        ],
      },
    ],
    questions: [
      {
        q: "In one sentence, what is the story this dashboard is telling?",
        gold: "The ED problem is concentrated in the evening shift (3pm-11pm), which has seen door-to-provider time nearly double in 6 months while day and night shifts are relatively stable — and this is confirmed by the LWBS data where 3pm-11pm accounts for the majority of patients who left without being seen.",
      },
      {
        q: "What is anomalous or unexpected in this data?",
        gold: "The HCAHPS Responsiveness score (48%) is dramatically lower than Communication (74%) and Pain Management (71%) — a 26pp gap between domains in the same patient experience. Patients feel nurses are communicating and managing pain adequately, but not responding quickly enough to call lights and requests. This is a capacity/workload issue, not a care quality issue, and it's directly downstream of the evening volume surge. Also notable: the night shift door-to-provider time is stable at 30-32 minutes despite presumably lower staffing, suggesting the night shift nurse-to-patient ratio is actually more appropriate for the overnight volume than the evening shift's.",
      },
      {
        q: "What would you ask next? Name the one piece of data you would pull before the meeting.",
        gold: "Pull the evening shift (3pm-11pm) nurse-to-patient ratio by month for the past 6 months alongside the volume data. If volume grew 18% but nursing FTEs on evening shift stayed flat, the responsiveness problem and door-to-provider increase are both direct consequences of a coverage gap that's been widening for months. That's a staffing solution, not a process solution — and it changes the CNO's restructuring conversation entirely.",
      },
    ],
  },

// FINANCE: drills 2-5
  {
    id: "finance-2",
    domain: "finance",
    title: "Working Capital Health Dashboard — Manufacturing Co.",
    subtitle: "Q1 2026 vs prior year Q1",
    scenario: "You are the FP&A analyst at a $280M manufacturing company. Free cash flow is significantly below EBITDA despite strong earnings. The CFO is presenting to the board next week and needs a working capital narrative.",
    kpis: [
      { label: "CASH CONVERSION CYCLE", value: "74 days", delta: "▲ 28 days YoY", up: false },
      { label: "DAYS IN AR (DSO)", value: "52 days", delta: "▲ 14 days YoY", up: false },
      { label: "DAYS INVENTORY (DIO)", value: "68 days", delta: "▲ 18 days YoY", up: false },
      { label: "DAYS PAYABLE (DPO)", value: "46 days", delta: "▲ 4 days YoY", up: false },
    ],
    charts: [
      {
        type: "lineMulti",
        title: "CASH CONVERSION CYCLE COMPONENTS — QUARTERLY",
        series: [
          { label: "DSO", color: "#f87171", points: [38, 40, 44, 48, 52] },
          { label: "DIO", color: "#fbbf24", points: [50, 54, 58, 62, 68] },
          { label: "DPO", color: "#4ade80", points: [42, 42, 43, 44, 46] },
        ],
        xLabels: ["Q1 25", "Q2 25", "Q3 25", "Q4 25", "Q1 26"],
        yMax: 80,
        yUnit: "days",
      },
      {
        type: "barCategorical",
        title: "DSO BY CUSTOMER SEGMENT — Q1 2026",
        bars: [
          { label: "Enterprise (>$5M)", value: 82, color: "#f87171" },
          { label: "Mid-Market", value: 48, color: "#fbbf24" },
          { label: "SMB (<$500K)", value: 31, color: "#4ade80" },
          { label: "Government", value: 94, color: "#f87171" },
        ],
        unit: "days",
        yMax: 110,
      },
      {
        type: "barHorizontal",
        title: "INVENTORY BY CATEGORY — DAYS ON HAND",
        bars: [
          { label: "Raw materials", value: 38, max: 80 },
          { label: "WIP", value: 12, max: 80 },
          { label: "Finished goods — fast", value: 22, max: 80 },
          { label: "Finished goods — slow", value: 68, max: 80 },
          { label: "MRO/spare parts", value: 142, max: 80 },
        ],
      },
    ],
    questions: [
      {
        q: "In one sentence, what is the story this dashboard is telling?",
        gold: "The cash conversion cycle expanded 28 days over 12 months because both DSO and DIO are growing without proportional DPO offset — Enterprise and Government customers are paying significantly slower, and slow-moving finished goods plus MRO inventory have accumulated to levels well above operational needs.",
      },
      {
        q: "What is anomalous or unexpected in this data?",
        gold: "MRO and spare parts inventory at 142 days on hand is far above any operational benchmark — MRO typically runs 30-45 days. This is likely stranded inventory from a past equipment or maintenance initiative that never got cleaned up. It's not generating revenue, it's not turning, and it's sitting on the balance sheet consuming working capital. Combined with slow finished goods at 68 days, these two categories alone are probably $15-20M of trapped cash that has nothing to do with the business model.",
      },
      {
        q: "What would you ask next? Name the one piece of data you would pull before the meeting.",
        gold: "Pull the Enterprise and Government customer aging detail — specifically which customers have expanded their payment terms in the last 12 months and whether this was formalized in a contract amendment or is informal slow-pay behavior. If it's informal, we have immediate leverage to enforce existing terms. If it was contractually amended, those amendments should have been flagged as working capital impacts at signing. Either way, the answer determines whether the fix is collections enforcement or contract renegotiation.",
      },
    ],
  },
  {
    id: "finance-3",
    domain: "finance",
    title: "SaaS Unit Economics Dashboard",
    subtitle: "Trailing 4 quarters, monthly cohorts",
    scenario: "You are the growth finance analyst at a $38M ARR B2B SaaS company. The board's investment committee is meeting next month to decide whether to approve a $15M growth round. They've asked for a unit economics brief before the term sheet conversation.",
    kpis: [
      { label: "BLENDED CAC", value: "$8,420", delta: "▲ 64% over 18 months", up: false },
      { label: "LTV (24-MO COHORT)", value: "$22,100", delta: "▲ 8% over 18 months", up: false },
      { label: "LTV:CAC RATIO", value: "2.6×", delta: "▼ from 4.2× 18 months ago", up: false },
      { label: "CAC PAYBACK PERIOD", value: "28 months", delta: "▲ 11 months over 18 months", up: false },
    ],
    charts: [
      {
        type: "lineMulti",
        title: "CAC BY CHANNEL — QUARTERLY ($K)",
        series: [
          { label: "Inbound/SEO", color: "#4ade80", points: [2.8, 3.1, 3.2, 3.4] },
          { label: "Outbound SDR", color: "#4fc3f7", points: [6.2, 7.1, 8.4, 9.8] },
          { label: "Paid Search", color: "#fbbf24", points: [5.8, 8.2, 11.4, 14.2] },
          { label: "Events/Field", color: "#f87171", points: [12.4, 16.8, 22.1, 28.4] },
        ],
        xLabels: ["Q2 25", "Q3 25", "Q4 25", "Q1 26"],
        yMax: 32,
        yUnit: "$K",
      },
      {
        type: "barCategorical",
        title: "LTV:CAC BY CHANNEL — Q1 2026",
        bars: [
          { label: "Inbound/SEO", value: 7.8, color: "#4ade80" },
          { label: "Outbound SDR", value: 3.1, color: "#4fc3f7" },
          { label: "Paid Search", value: 1.9, color: "#f87171" },
          { label: "Events/Field", value: 0.9, color: "#f87171" },
        ],
        unit: "×",
        yMax: 9,
      },
      {
        type: "barHorizontal",
        title: "MARKETING BUDGET ALLOCATION — Q1 2026 (%)",
        bars: [
          { label: "Events/Field", value: 38, max: 50 },
          { label: "Paid Search", value: 28, max: 50 },
          { label: "Outbound SDR", value: 22, max: 50 },
          { label: "Inbound/SEO", value: 12, max: 50 },
        ],
      },
    ],
    questions: [
      {
        q: "In one sentence, what is the story this dashboard is telling?",
        gold: "Two channels (Events/Field at 0.9× LTV:CAC and Paid Search at 1.9×) are destroying unit economics while consuming 66% of the marketing budget, while Inbound/SEO at 7.8× LTV:CAC — the highest-returning channel — gets only 12% of spend.",
      },
      {
        q: "What is anomalous or unexpected in this data?",
        gold: "Events/Field CAC has gone from $12.4K to $28.4K in four quarters — a 2.3× increase — while LTV hasn't moved proportionally. A CAC that's grown 129% in 12 months on a channel that consumes 38% of the budget is the single most alarming number on this dashboard. Combined with LTV:CAC of 0.9× (meaning we're spending more to acquire customers than we'll ever recover from them), this channel is actively destroying value at current spend levels. No board would approve a $15M growth round to scale a channel with sub-1.0× LTV:CAC.",
      },
      {
        q: "What would you ask next? Name the one piece of data you would pull before the meeting.",
        gold: "Pull the LTV of customers acquired through Events/Field vs Inbound/SEO, segmented by customer segment (company size, industry). The hypothesis: Events/Field is bringing in a fundamentally different (worse) customer profile — perhaps smaller companies with shorter retention — not just a more expensive version of the same customer. If the customer profile differs, cutting Events/Field isn't just a CAC fix; it's a customer quality fix. That's the argument that lands with an investment committee.",
      },
    ],
  },
  {
    id: "finance-4",
    domain: "finance",
    title: "Public Company Earnings Review — Q1 2026",
    subtitle: "Reported vs Consensus Estimates",
    scenario: "You are the equity analyst covering a mid-cap consumer technology company. Q1 results just dropped. You have 20 minutes to write your morning note before the market opens.",
    kpis: [
      { label: "REVENUE", value: "$284M", delta: "▼ $8M vs consensus", up: false },
      { label: "ADJ. EPS", value: "$0.82", delta: "▲ $0.06 vs consensus", up: true },
      { label: "GROSS MARGIN", value: "61.4%", delta: "▲ 2.1pp YoY", up: true },
      { label: "FWD GUIDANCE (Q2)", value: "$271-278M", delta: "▼ $14M below consensus", up: false },
    ],
    charts: [
      {
        type: "lineMulti",
        title: "QUARTERLY REVENUE — ACTUAL VS CONSENSUS ($M)",
        series: [
          { label: "Consensus", color: "#4fc3f7", points: [262, 271, 278, 292] },
          { label: "Actual", color: "#fbbf24", points: [264, 270, 276, 284] },
        ],
        xLabels: ["Q2 25", "Q3 25", "Q4 25", "Q1 26"],
        yMax: 310,
        yUnit: "$M",
      },
      {
        type: "barCategorical",
        title: "REVENUE BY SEGMENT — Q1 2026 vs PRIOR YEAR ($M)",
        bars: [
          { label: "Hardware", value: 142, color: "#f87171" },
          { label: "Software/SaaS", value: 98, color: "#4ade80" },
          { label: "Services", value: 44, color: "#4fc3f7" },
        ],
        unit: "$M",
        yMax: 180,
      },
      {
        type: "barHorizontal",
        title: "Q1 EPS BRIDGE — BEAT DRIVERS ($M impact)",
        bars: [
          { label: "Gross margin expansion", value: 14, max: 20 },
          { label: "OpEx reduction (layoffs)", value: 18, max: 20 },
          { label: "Lower tax rate (one-time)", value: 8, max: 20 },
          { label: "Revenue miss (negative)", value: 12, max: 20 },
          { label: "Higher D&A (negative)", value: 6, max: 20 },
        ],
      },
    ],
    questions: [
      {
        q: "In one sentence, what is the story this dashboard is telling?",
        gold: "The EPS beat is a cost story, not a growth story — gross margin expansion and layoffs drove the earnings outperformance while revenue missed consensus for the fourth consecutive quarter, and the Q2 guide ($271-278M vs consensus $292M) signals the revenue deceleration is accelerating, not stabilizing.",
      },
      {
        q: "What is anomalous or unexpected in this data?",
        gold: "The EPS bridge reveals that the $0.06 EPS beat was built on layoffs ($18M impact), a one-time tax benefit ($8M), and gross margin expansion — but the layoffs and tax benefit are non-recurring, meaning Q2 will not have the same tailwinds. Combined with a Q2 guide $14M below consensus, the market should trade this as a deteriorating growth business using cost cuts to mask revenue weakness. The gross margin expansion is the only genuine positive — if it's durable, it matters; if it's from product mix shift or temporary input cost relief, it's also non-recurring.",
      },
      {
        q: "What would you ask next? Name the one piece of data you would pull before the meeting.",
        gold: "Pull the Hardware segment YoY growth rate alongside management's commentary on unit volumes vs pricing. Hardware revenue appears to be declining (smallest segment, showing on the chart) and hardware is typically the lead indicator for the software attach rate. If hardware units are declining, software/SaaS growth will decelerate 2-3 quarters later as the install base shrinks — which would make the Q2 guide miss look conservative, not prudent.",
      },
    ],
  },
  {
    id: "finance-5",
    domain: "finance",
    title: "Cost Structure Analysis — Pre-IPO Review",
    subtitle: "Trailing 8 quarters operating leverage analysis",
    scenario: "You are the CFO's analyst at a growth-stage SaaS company preparing for IPO in 12 months. The underwriters have flagged that the company's cost structure doesn't show operating leverage, which is a concern for public market investors. You need to present a path to margin improvement.",
    kpis: [
      { label: "REVENUE GROWTH (YoY)", value: "42%", delta: "Strong", up: true },
      { label: "GROSS MARGIN", value: "76%", delta: "▲ 3pp YoY", up: true },
      { label: "OPERATING MARGIN", value: "▼18%", delta: "▼ 4pp YoY", up: false },
      { label: "SG&A AS % OF REVENUE", value: "62%", delta: "▲ 8pp YoY", up: false },
    ],
    charts: [
      {
        type: "lineMulti",
        title: "REVENUE vs OPEX GROWTH — QUARTERLY (% YoY)",
        series: [
          { label: "Revenue Growth", color: "#4ade80", points: [38, 40, 41, 42, 42] },
          { label: "R&D Growth", color: "#4fc3f7", points: [42, 44, 46, 48, 52] },
          { label: "S&M Growth", color: "#fbbf24", points: [48, 54, 58, 62, 68] },
          { label: "G&A Growth", color: "#f87171", points: [52, 58, 64, 71, 78] },
        ],
        xLabels: ["Q1 25", "Q2 25", "Q3 25", "Q4 25", "Q1 26"],
        yMax: 85,
        yUnit: "% YoY",
      },
      {
        type: "barCategorical",
        title: "HEADCOUNT BY FUNCTION — Q1 2026",
        bars: [
          { label: "Engineering", value: 284, color: "#4fc3f7" },
          { label: "Sales", value: 218, color: "#fbbf24" },
          { label: "G&A", value: 142, color: "#f87171" },
          { label: "Marketing", value: 96, color: "#fbbf24" },
          { label: "CS/Support", value: 88, color: "#4ade80" },
        ],
        unit: "FTEs",
        yMax: 300,
      },
      {
        type: "barHorizontal",
        title: "G&A HEADCOUNT vs REVENUE BENCHMARK (PER $10M REVENUE)",
        bars: [
          { label: "This company", value: 18, max: 20 },
          { label: "Series D peer avg", value: 12, max: 20 },
          { label: "Pre-IPO peer avg", value: 9, max: 20 },
          { label: "Post-IPO peer avg", value: 7, max: 20 },
        ],
      },
    ],
    questions: [
      {
        q: "In one sentence, what is the story this dashboard is telling?",
        gold: "Revenue is growing at 42% but every operating expense category is growing faster — G&A at 78% YoY, S&M at 68% — and G&A headcount per $10M of revenue is 2× the pre-IPO peer benchmark, which is the specific number underwriters are flagging as evidence that the company hasn't built scalable infrastructure.",
      },
      {
        q: "What is anomalous or unexpected in this data?",
        gold: "G&A growing at 78% YoY on 42% revenue growth is the outlier — R&D and S&M over-growing revenue is common in growth-stage SaaS and somewhat defensible, but G&A (Finance, HR, Legal, IT) is a pure overhead function that should exhibit the strongest operating leverage as revenue scales. G&A at 18 FTEs per $10M vs the 9 FTE post-IPO benchmark means the company is running double the administrative overhead of comparable public companies. This is almost certainly the underwriters' specific concern — it suggests the company hasn't rightsized its back-office for scale.",
      },
      {
        q: "What would you ask next? Name the one piece of data you would pull before the meeting.",
        gold: "Pull the G&A headcount breakdown by sub-function (Finance team size vs HR vs Legal vs IT vs Facilities) and compare each to the peer benchmark. The aggregate 18 FTE/10M masks where the bloat actually is — it's almost never uniform. If Finance has 6 FTEs per $10M vs a benchmark of 2.5, the fix is Finance; if IT is the outlier, the fix is IT. Presenting the underwriters with a function-level benchmark analysis and a 24-month G&A rationalization roadmap turns their concern into a narrative of discipline, not a liability.",
      },
    ],
  },

// OPERATIONS: drills 2-5
  {
    id: "operations-2",
    domain: "operations",
    title: "Manufacturing Line OEE Dashboard — Plant B",
    subtitle: "Q1 2026 vs prior quarter and target",
    scenario: "You are the manufacturing analyst at a consumer goods plant. Plant B's OEE has declined for three consecutive quarters. The Plant Manager is meeting with the VP of Operations next week and needs to present a root cause and recovery plan.",
    kpis: [
      { label: "OEE", value: "58%", delta: "▼ 17pp vs target (75%)", up: false },
      { label: "AVAILABILITY", value: "74%", delta: "▼ 16pp vs target", up: false },
      { label: "PERFORMANCE", value: "89%", delta: "▼ 3pp vs target", up: false },
      { label: "QUALITY", value: "98.4%", delta: "Within target range", up: true },
    ],
    charts: [
      {
        type: "lineMulti",
        title: "OEE COMPONENTS — QUARTERLY TREND (%)",
        series: [
          { label: "Availability", color: "#f87171", points: [91, 86, 80, 74] },
          { label: "Performance", color: "#fbbf24", points: [92, 91, 90, 89] },
          { label: "Quality", color: "#4ade80", points: [98.8, 98.6, 98.5, 98.4] },
        ],
        xLabels: ["Q2 25", "Q3 25", "Q4 25", "Q1 26"],
        yMax: 100,
        yUnit: "%",
      },
      {
        type: "barCategorical",
        title: "DOWNTIME CAUSES — Q1 2026 (HOURS)",
        bars: [
          { label: "Mechanical failure", value: 142, color: "#f87171" },
          { label: "Planned maintenance", value: 68, color: "#4fc3f7" },
          { label: "Material shortage", value: 42, color: "#fbbf24" },
          { label: "Changeover", value: 38, color: "#fbbf24" },
          { label: "Operator/setup", value: 18, color: "#4ade80" },
        ],
        unit: "hrs",
        yMax: 160,
      },
      {
        type: "barHorizontal",
        title: "TOP 5 MECHANICAL FAILURES BY FREQUENCY — Q1 2026",
        bars: [
          { label: "Conveyor belt slippage", value: 38, max: 50 },
          { label: "Sealing unit jam", value: 31, max: 50 },
          { label: "Filler nozzle clog", value: 24, max: 50 },
          { label: "Label applicator misalign", value: 18, max: 50 },
          { label: "Vision system fault", value: 12, max: 50 },
        ],
      },
    ],
    questions: [
      {
        q: "In one sentence, what is the story this dashboard is telling?",
        gold: "The OEE problem is almost entirely an Availability problem — Performance and Quality are essentially at target — and the Availability loss is concentrated in mechanical failures (142 hours), specifically four recurring failure modes that together account for most of the unplanned downtime, suggesting equipment in need of targeted preventive maintenance, not a systemic overhaul.",
      },
      {
        q: "What is anomalous or unexpected in this data?",
        gold: "Quality is at 98.4% — holding steady through four quarters of declining Availability. This rules out operator degradation (tired/rushed operators would produce more defects), material quality issues, and process control problems. The failure modes are almost entirely mechanical: conveyor belt slippage, sealing unit jams, filler nozzle clogs, and label applicator misalignment are all predictable, maintainable failure points. The anomaly is that these failure modes are recurring across four quarters without being addressed through targeted preventive maintenance — which suggests the PM schedule hasn't been updated to reflect the actual failure pattern.",
      },
      {
        q: "What would you ask next? Name the one piece of data you would pull before the meeting.",
        gold: "Pull the preventive maintenance schedule and completion log for the conveyor belt, sealing unit, and filler nozzle for the past 12 months — specifically looking at whether PM tasks for these components were completed on schedule or deferred. If PM completion for these three components is running at 60-70% adherence while other components are at 90%+, the fix is PM schedule enforcement, not equipment replacement. That's a 30-day operational change, not a capital request.",
      },
    ],
  },
  {
    id: "operations-3",
    domain: "operations",
    title: "Supplier Performance Scorecard — Q1 2026",
    subtitle: "Top 10 suppliers by spend, quarterly review",
    scenario: "You are the procurement analyst preparing the quarterly supplier scorecard review. The VP of Procurement wants to identify which supplier relationships need intervention before the annual contract renewal cycle that begins next month.",
    kpis: [
      { label: "NETWORK SOTD (AVG)", value: "91.2%", delta: "▼ 4.8pp YoY", up: false },
      { label: "SUPPLIERS BELOW 90%", value: "4 of 10", delta: "Prior year: 1 of 10", up: false },
      { label: "LEAD TIME VARIANCE", value: "±6.4 days", delta: "▲ 3.1 days YoY", up: false },
      { label: "QUALITY DEFECT RATE", value: "1.8%", delta: "▲ 0.6pp YoY", up: false },
    ],
    charts: [
      {
        type: "barCategorical",
        title: "SUPPLIER ON-TIME DELIVERY — Q1 2026 (%)",
        bars: [
          { label: "Supplier A", value: 98, color: "#4ade80" },
          { label: "Supplier B", value: 96, color: "#4ade80" },
          { label: "Supplier C", value: 94, color: "#4ade80" },
          { label: "Supplier D", value: 91, color: "#4ade80" },
          { label: "Supplier E", value: 88, color: "#fbbf24" },
          { label: "Supplier F", value: 82, color: "#f87171" },
          { label: "Supplier G", value: 74, color: "#f87171" },
          { label: "Supplier H", value: 68, color: "#f87171" },
        ],
        unit: "%",
        yMax: 100,
      },
      {
        type: "lineMulti",
        title: "SUPPLIERS F, G, H — SOTD TREND (QUARTERLY %)",
        series: [
          { label: "Supplier F", color: "#fbbf24", points: [94, 91, 86, 82] },
          { label: "Supplier G", color: "#f87171", points: [92, 88, 80, 74] },
          { label: "Supplier H", color: "#f87171", points: [96, 90, 78, 68] },
        ],
        xLabels: ["Q2 25", "Q3 25", "Q4 25", "Q1 26"],
        yMax: 100,
        yUnit: "%",
      },
      {
        type: "barHorizontal",
        title: "SUPPLIER H — LATE DELIVERY ROOT CAUSES Q1 2026 (%)",
        bars: [
          { label: "Raw material shortage", value: 48, max: 60 },
          { label: "Production capacity", value: 31, max: 60 },
          { label: "Port/logistics delay", value: 14, max: 60 },
          { label: "Quality hold", value: 7, max: 60 },
        ],
      },
    ],
    questions: [
      {
        q: "In one sentence, what is the story this dashboard is telling?",
        gold: "Three suppliers (F, G, H) have been in a sustained, accelerating SOTD decline for four consecutive quarters — this isn't noise or a bad quarter, it's a structural deterioration trend — and Supplier H at 68% SOTD with raw material shortage as the primary root cause is the highest near-term risk to our production schedule.",
      },
      {
        q: "What is anomalous or unexpected in this data?",
        gold: "Suppliers F, G, and H are all declining simultaneously and at an accelerating rate — Supplier H dropped 28pp in four quarters, which is almost certainly capacity or financial distress, not a process problem. Suppliers A-D are stable at 91-98%, which rules out a demand forecast or lead time problem on our side. The fact that three suppliers are deteriorating while four are stable suggests these three suppliers share a common problem — possibly a shared raw material input, a shared logistics lane, or a shared geographic risk — rather than three independent failures.",
      },
      {
        q: "What would you ask next? Name the one piece of data you would pull before the meeting.",
        gold: "Determine whether Suppliers F, G, and H share a common upstream input or geography. If all three source a critical raw material from the same region or use the same logistics carrier, the root cause is systemic and affects all three simultaneously. That would change the intervention from three separate supplier conversations to a single supply chain risk mitigation: identifying alternate sources for the shared input before the annual contract renewal.",
      },
    ],
  },
  {
    id: "operations-4",
    domain: "operations",
    title: "Fulfillment Center Productivity Dashboard — FC East",
    subtitle: "Week 18 of 2026",
    scenario: "You are the operations analyst for a DTC fulfillment network. FC East has been flagged for two consecutive weeks of below-target labor productivity. The Fulfillment Director wants a root cause before deciding whether to pull in additional temporary headcount.",
    kpis: [
      { label: "UNITS PER LABOR HOUR", value: "82", delta: "▼ 24 vs target (106)", up: false },
      { label: "ORDERS SHIPPED ON TIME", value: "91.4%", delta: "▼ 5.8pp vs target", up: false },
      { label: "PICK ACCURACY", value: "99.4%", delta: "Within target", up: true },
      { label: "NEW HIRE MIX (FC EAST)", value: "44%", delta: "Network avg: 18%", up: false },
    ],
    charts: [
      {
        type: "lineMulti",
        title: "UNITS PER LABOR HOUR — FC EAST vs NETWORK",
        series: [
          { label: "Network Average", color: "#4ade80", points: [104, 106, 105, 107, 106, 106] },
          { label: "FC East", color: "#f87171", points: [105, 104, 100, 94, 88, 82] },
        ],
        xLabels: ["W13", "W14", "W15", "W16", "W17", "W18"],
        yMax: 120,
        yUnit: "units/hr",
      },
      {
        type: "barCategorical",
        title: "PRODUCTIVITY BY TENURE BAND — FC EAST W18",
        bars: [
          { label: "0-30 days", value: 61, color: "#f87171" },
          { label: "31-90 days", value: 78, color: "#fbbf24" },
          { label: "91-180 days", value: 96, color: "#4fc3f7" },
          { label: "180+ days", value: 112, color: "#4ade80" },
        ],
        unit: "units/hr",
        yMax: 130,
      },
      {
        type: "barHorizontal",
        title: "LABOR HOURS BY TENURE BAND — FC EAST W18 (%)",
        bars: [
          { label: "0-30 days (new hire)", value: 44, max: 50 },
          { label: "31-90 days", value: 24, max: 50 },
          { label: "91-180 days", value: 18, max: 50 },
          { label: "180+ days (experienced)", value: 14, max: 50 },
        ],
      },
    ],
    questions: [
      {
        q: "In one sentence, what is the story this dashboard is telling?",
        gold: "44% of FC East's labor hours are being worked by associates in their first 30 days (at 61 units/hr vs 112 for experienced workers), and the network average new-hire mix is only 18% — meaning FC East has a concentration of inexperienced labor that's mathematically sufficient to explain the entire productivity gap without any process or equipment problem.",
      },
      {
        q: "What is anomalous or unexpected in this data?",
        gold: "Pick accuracy is 99.4% — within target — while units per labor hour is 23% below target. This is the specific signature of inexperienced-but-careful workers: new hires work slowly and deliberately, which produces high accuracy but low throughput. If the productivity problem were equipment or process-related, accuracy would degrade alongside throughput. The data pattern rules out process failure and points directly to workforce tenure mix as the cause.",
      },
      {
        q: "What would you ask next? Name the one piece of data you would pull before the meeting.",
        gold: "Pull the historical productivity ramp curve for FC East new hires from prior hiring cohorts — specifically, how many weeks it takes for new associates to reach 90% of target productivity. If the historical ramp is 8-10 weeks, and the current new-hire cohort is at week 3-4, the productivity gap is temporary and self-resolving without additional headcount. If the ramp historically takes 14+ weeks, temporary headcount makes sense to bridge the gap. The decision depends entirely on the ramp duration, which is a known number from prior cohort data.",
      },
    ],
  },
  {
    id: "operations-5",
    domain: "operations",
    title: "Inventory Health Dashboard — National Retail Network",
    subtitle: "Q1 2026 end-of-period",
    scenario: "You are the inventory analytics lead at a national specialty retailer. Total inventory has grown 28% YoY but gross margin dollars are flat, suggesting inventory is building without proportional revenue. The CFO has asked for a working capital diagnostic before the bank covenant review.",
    kpis: [
      { label: "TOTAL INVENTORY ($M)", value: "$184M", delta: "▲ 28% YoY", up: false },
      { label: "INVENTORY TURNOVER", value: "4.8×", delta: "▼ from 6.2× YoY", up: false },
      { label: "WEEKS OF SUPPLY", value: "10.8 wks", delta: "▲ 3.4 wks YoY", up: false },
      { label: "AGED INVENTORY (>180 days)", value: "$38M", delta: "▲ 142% YoY", up: false },
    ],
    charts: [
      {
        type: "barCategorical",
        title: "INVENTORY TURNOVER BY CATEGORY — Q1 2026 vs PRIOR YEAR",
        bars: [
          { label: "Electronics", value: 7.8, color: "#4ade80" },
          { label: "Apparel", value: 4.2, color: "#fbbf24" },
          { label: "Home Goods", value: 3.8, color: "#fbbf24" },
          { label: "Seasonal", value: 2.1, color: "#f87171" },
          { label: "Accessories", value: 1.8, color: "#f87171" },
        ],
        unit: "×",
        yMax: 9,
      },
      {
        type: "lineMulti",
        title: "AGED INVENTORY (>180 DAYS) — QUARTERLY ($M)",
        series: [
          { label: "Aged Inventory", color: "#f87171", points: [15.7, 19.2, 26.4, 38.1] },
          { label: "Total Inventory", color: "#4fc3f7", points: [143, 152, 164, 184] },
        ],
        xLabels: ["Q2 25", "Q3 25", "Q4 25", "Q1 26"],
        yMax: 200,
        yUnit: "$M",
      },
      {
        type: "barHorizontal",
        title: "AGED INVENTORY BY CATEGORY — Q1 2026 ($M)",
        bars: [
          { label: "Seasonal", value: 18.4, max: 20 },
          { label: "Accessories", value: 12.8, max: 20 },
          { label: "Home Goods", value: 4.2, max: 20 },
          { label: "Apparel", value: 2.1, max: 20 },
          { label: "Electronics", value: 0.6, max: 20 },
        ],
      },
    ],
    questions: [
      {
        q: "In one sentence, what is the story this dashboard is telling?",
        gold: "The inventory buildup is concentrated in Seasonal and Accessories ($31M of $38M aged inventory) — categories with the lowest turns — while Electronics continues to turn at 7.8× and barely shows in aged inventory, indicating the problem is category-level overbuy or poor in-season management, not broad demand weakness.",
      },
      {
        q: "What is anomalous or unexpected in this data?",
        gold: "Aged inventory grew 142% YoY while total inventory grew only 28% — the aged bucket is growing nearly 5× faster than total inventory. This is the signature of accumulating unsold inventory that isn't being marked down and liquidated — it's being carried on the books at full cost while continuing to occupy floor space and tie up working capital. The fact that this accelerated across four quarters without intervention (from $15.7M to $38M) suggests there's no systematic aged-inventory review and action protocol in place.",
      },
      {
        q: "What would you ask next? Name the one piece of data you would pull before the meeting.",
        gold: "Pull the current carrying cost of the $38M aged inventory (storage cost + cost of capital + estimated markdown to clear) vs the expected recovery value at current markdown depth and velocity. If the aged inventory will recover $22M at a 40% markdown but costs $4M per quarter to carry, the financial case for taking an immediate $16M markdown loss is stronger than carrying for another two quarters. The bank covenant review makes this urgent — carrying $38M of low-recovery inventory against the covenant calculation is a harder conversation than showing a clean markdown plan.",
      },
    ],
  },

// MARKETING: drills 2-5
  {
    id: "marketing-2",
    domain: "marketing",
    title: "Organic Search & Content Performance Dashboard",
    subtitle: "Q1 2026 vs Q1 2025",
    scenario: "You are the digital analytics lead at a B2B software company. The Head of Content has invested $800K in content marketing over the past 18 months with the promise of organic traffic compounding. Q1 results are in and leadership is questioning the ROI.",
    kpis: [
      { label: "ORGANIC SESSIONS", value: "184,200", delta: "▲ 24% YoY", up: true },
      { label: "ORGANIC-TO-LEAD RATE", value: "1.8%", delta: "▼ 1.4pp YoY", up: false },
      { label: "ORGANIC MQL VOLUME", value: "3,316", delta: "▼ 18% YoY", up: false },
      { label: "COST PER ORGANIC MQL", value: "$241", delta: "▲ $128 YoY (at $800K spend)", up: false },
    ],
    charts: [
      {
        type: "lineMulti",
        title: "ORGANIC SESSIONS BY CONTENT TYPE — MONTHLY",
        series: [
          { label: "Informational/Blog", color: "#4fc3f7", points: [28, 34, 42, 51, 58, 64, 72, 78, 84, 88, 91, 94] },
          { label: "Product/Solution pages", color: "#4ade80", points: [18, 19, 20, 21, 21, 22, 22, 23, 23, 24, 24, 25] },
          { label: "Comparison pages", color: "#fbbf24", points: [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19] },
        ],
        xLabels: ["Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar"],
        yMax: 100,
        yUnit: "K sessions",
      },
      {
        type: "barCategorical",
        title: "CONVERSION RATE BY CONTENT TYPE — Q1 2026 (%)",
        bars: [
          { label: "Comparison pages", value: 4.8, color: "#4ade80" },
          { label: "Product/Solution", value: 3.2, color: "#4ade80" },
          { label: "Informational/Blog", value: 0.4, color: "#f87171" },
        ],
        unit: "%",
        yMax: 6,
      },
      {
        type: "barHorizontal",
        title: "ORGANIC SESSIONS vs MQL CONTRIBUTION BY TYPE",
        bars: [
          { label: "Informational/Blog (51% sessions)", value: 18, max: 100 },
          { label: "Product pages (14% sessions)", value: 44, max: 100 },
          { label: "Comparison pages (10% sessions)", value: 38, max: 100 },
        ],
      },
    ],
    questions: [
      {
        q: "In one sentence, what is the story this dashboard is telling?",
        gold: "The content investment drove organic traffic growth (+24%) but the traffic is almost entirely low-converting informational content (0.4% conversion rate, 18% of MQL contribution) while the high-converting pages — Comparison (4.8%) and Product/Solution (3.2%) — grew slowly and together contribute 82% of MQLs on only 24% of sessions.",
      },
      {
        q: "What is anomalous or unexpected in this data?",
        gold: "The MQL output actually declined 18% YoY despite a 24% increase in organic sessions — traffic grew and leads fell simultaneously. This inverse relationship means the content mix has shifted toward traffic-generating-but-non-converting informational content, diluting the blended conversion rate from 3.2% to 1.8%. The Cost per Organic MQL nearly doubled not because the content got more expensive but because it got less effective per dollar at generating commercial intent. The $800K investment bought impressive-looking traffic that isn't actually supporting the sales funnel.",
      },
      {
        q: "What would you ask next? Name the one piece of data you would pull before the meeting.",
        gold: "Pull the content investment breakdown (how much of the $800K went to informational blog vs comparison pages vs product content) alongside the MQL-to-SQL conversion rates by content source. If comparison page visitors convert at 4.8% to MQL and then convert at 40% to SQL, while blog visitors convert at 0.4% to MQL and then at 12% to SQL, the downstream pipeline contribution of blog content is essentially zero. That math makes the reallocation recommendation to commercial-intent content a revenue argument, not just a traffic argument.",
      },
    ],
  },
  {
    id: "marketing-3",
    domain: "marketing",
    title: "Social Media & Community Dashboard",
    subtitle: "Q1 2026 vs Q1 2025",
    scenario: "You are the social media analyst at a DTC wellness brand. The brand has invested in growing Instagram and TikTok presence over the past year. Q1 results are in and the CMO wants to understand why social traffic hasn't converted to meaningful revenue growth despite follower growth.",
    kpis: [
      { label: "TOTAL FOLLOWERS", value: "284K", delta: "▲ 68% YoY", up: true },
      { label: "AVG ENGAGEMENT RATE", value: "2.1%", delta: "▼ 1.8pp YoY", up: false },
      { label: "SOCIAL-ATTRIBUTED REVENUE", value: "$184K", delta: "▲ 8% YoY", up: true },
      { label: "REVENUE PER FOLLOWER", value: "$0.65", delta: "▼ $0.72 YoY", up: false },
    ],
    charts: [
      {
        type: "lineMulti",
        title: "FOLLOWERS vs ENGAGEMENT RATE — MONTHLY",
        series: [
          { label: "Followers (×10K)", color: "#4fc3f7", points: [16.9, 18.2, 19.8, 21.4, 23.1, 24.8, 26.2, 27.4, 28.1, 28.0, 28.2, 28.4] },
          { label: "Engagement Rate (%)", color: "#f87171", points: [3.8, 3.6, 3.4, 3.2, 3.1, 2.9, 2.8, 2.6, 2.4, 2.2, 2.2, 2.1] },
        ],
        xLabels: ["Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar"],
        yMax: 45,
      },
      {
        type: "barCategorical",
        title: "CONTENT TYPE PERFORMANCE — AVG ENGAGEMENT RATE Q1 2026",
        bars: [
          { label: "UGC/Repost", value: 4.8, color: "#4ade80" },
          { label: "Founder content", value: 4.2, color: "#4ade80" },
          { label: "Product how-to", value: 3.1, color: "#4fc3f7" },
          { label: "Lifestyle/Brand", value: 1.8, color: "#fbbf24" },
          { label: "Promotional", value: 0.9, color: "#f87171" },
        ],
        unit: "%",
        yMax: 6,
      },
      {
        type: "barHorizontal",
        title: "POST FREQUENCY BY CONTENT TYPE — Q1 2026 (% of posts)",
        bars: [
          { label: "Promotional", value: 42, max: 50 },
          { label: "Lifestyle/Brand", value: 31, max: 50 },
          { label: "Product how-to", value: 14, max: 50 },
          { label: "Founder content", value: 8, max: 50 },
          { label: "UGC/Repost", value: 5, max: 50 },
        ],
      },
    ],
    questions: [
      {
        q: "In one sentence, what is the story this dashboard is telling?",
        gold: "The brand is growing followers but declining in engagement because 73% of posts are the lowest-performing content types (Promotional at 0.9% and Lifestyle at 1.8%), while the highest-performing content (UGC at 4.8%, Founder at 4.2%) accounts for only 13% of posts — the audience is growing but becoming less engaged because the content mix is optimized for posting volume, not audience resonance.",
      },
      {
        q: "What is anomalous or unexpected in this data?",
        gold: "The engagement rate decay is perfectly inverse to the follower growth — as the account scaled, engagement fell at nearly the same rate followers grew, suggesting that the growth tactics (likely paid follower acquisition or broad hashtag strategies) brought in followers who don't genuinely connect with the brand. Revenue per follower also fell from $1.37 to $0.65, meaning each marginal follower is worth less than prior followers. This is an audience quality problem, not a content quality problem — the brand is measuring the wrong growth metric.",
      },
      {
        q: "What would you ask next? Name the one piece of data you would pull before the meeting.",
        gold: "Pull the engagement rate and story link-click rate (or link-in-bio click rate) for UGC and Founder content specifically for the past 6 months — and compare this to the click-to-purchase conversion rate on the traffic those posts generated. If UGC and Founder posts drive 4-5× the engagement AND 3× the click-to-purchase rate, the recommendation to shift 40-50% of content toward those formats has a revenue case that's stronger than the engagement case. The CMO cares about revenue; engagement rate is the means, not the end.",
      },
    ],
  },
  {
    id: "marketing-4",
    domain: "marketing",
    title: "Paid Search Performance Dashboard — B2B SaaS",
    subtitle: "Q1 2026 vs Q4 2025",
    scenario: "You are the demand generation analyst. Paid search is the largest marketing channel at $420K quarterly spend. The VP of Marketing needs to justify the Q2 budget renewal to the CFO, who is skeptical about paid search efficiency.",
    kpis: [
      { label: "TOTAL SPEND", value: "$420K", delta: "Same as Q4", up: true },
      { label: "MQL VOLUME", value: "1,284", delta: "▼ 18% vs Q4", up: false },
      { label: "COST PER MQL", value: "$327", delta: "▲ $72 vs Q4", up: false },
      { label: "PIPELINE INFLUENCED", value: "$4.2M", delta: "▼ 12% vs Q4", up: false },
    ],
    charts: [
      {
        type: "lineMulti",
        title: "COST PER MQL BY KEYWORD CATEGORY — QUARTERLY ($)",
        series: [
          { label: "Brand keywords", color: "#4ade80", points: [48, 51, 49, 52] },
          { label: "Competitor keywords", color: "#4fc3f7", points: [184, 198, 212, 228] },
          { label: "Category keywords", color: "#fbbf24", points: [284, 318, 364, 412] },
          { label: "Problem-aware", color: "#f87171", points: [142, 168, 198, 241] },
        ],
        xLabels: ["Q2 25", "Q3 25", "Q4 25", "Q1 26"],
        yMax: 450,
        yUnit: "$",
      },
      {
        type: "barCategorical",
        title: "SPEND ALLOCATION BY KEYWORD CATEGORY — Q1 2026 (%)",
        bars: [
          { label: "Category keywords", value: 44, color: "#fbbf24" },
          { label: "Problem-aware", value: 28, color: "#f87171" },
          { label: "Competitor", value: 18, color: "#4fc3f7" },
          { label: "Brand", value: 10, color: "#4ade80" },
        ],
        unit: "%",
        yMax: 50,
      },
      {
        type: "barHorizontal",
        title: "MQL-TO-SQL CONVERSION RATE BY KEYWORD CATEGORY (%)",
        bars: [
          { label: "Brand keywords", value: 42, max: 50 },
          { label: "Competitor keywords", value: 31, max: 50 },
          { label: "Problem-aware", value: 18, max: 50 },
          { label: "Category keywords", value: 8, max: 50 },
        ],
      },
    ],
    questions: [
      {
        q: "In one sentence, what is the story this dashboard is telling?",
        gold: "72% of the paid search budget is going to category and problem-aware keywords that cost $241-412 per MQL and convert at 8-18% to SQL, while Brand keywords cost $52 per MQL and convert at 42% to SQL — but Brand only gets 10% of the budget because it has limited scale, leaving competitor keywords as the most efficient scalable growth lever at $228 CPM and 31% SQL conversion.",
      },
      {
        q: "What is anomalous or unexpected in this data?",
        gold: "Category keyword CPM has grown from $284 to $412 in four quarters — a 45% increase — while MQL-to-SQL conversion at 8% suggests these keywords are attracting early-stage researchers, not buyers. Spending 44% of budget on the highest-cost, lowest-converting keyword category and watching that cost escalate every quarter is the core efficiency problem. The 'problem-aware' category at $241 CPM and 18% SQL conversion is actually more efficient but only gets 28% of budget.",
      },
      {
        q: "What would you ask next? Name the one piece of data you would pull before the meeting.",
        gold: "Pull the 6-month pipeline-to-close rate (win rate) segmented by keyword category — specifically whether Category keyword MQLs that do convert to SQL close at a different rate than Competitor or Brand keyword MQLs. A 8% MQL-to-SQL rate is recoverable if Category keyword deals close at 40% (suggesting they're educating the market and then winning late); it's unrecoverable if they close at 12% (suggesting they're generating trial interest that doesn't convert). The full funnel math, not just the MQL cost, determines whether the reallocation recommendation is correct.",
      },
    ],
  },
  {
    id: "marketing-5",
    domain: "marketing",
    title: "Customer Retention & Lifecycle Dashboard",
    subtitle: "Q1 2026 cohort analysis",
    scenario: "You are the lifecycle marketing analyst at a subscription e-commerce brand. The Retention team has been running campaigns for 12 months. The CMO wants to know whether the retention investment is working before deciding whether to increase the budget for Q2.",
    kpis: [
      { label: "90-DAY RETENTION", value: "38%", delta: "▲ 3pp vs prior year", up: true },
      { label: "REACTIVATION RATE", value: "8.2%", delta: "▲ 1.4pp vs prior year", up: true },
      { label: "CHURN WITHIN 30 DAYS", value: "31%", delta: "▼ 2pp vs prior year", up: true },
      { label: "INCREMENTAL RETENTION LIFT", value: "Unclear", delta: "No holdout test running", up: false },
    ],
    charts: [
      {
        type: "lineMulti",
        title: "RETENTION CURVE — TREATED vs HISTORICAL BENCHMARK (%)",
        series: [
          { label: "Historical benchmark", color: "#4fc3f7", points: [100, 72, 58, 46, 38, 34] },
          { label: "Q1 2026 treated cohort", color: "#4ade80", points: [100, 74, 61, 50, 40, 37] },
        ],
        xLabels: ["Day 0", "Day 30", "Day 60", "Day 90", "Day 120", "Day 150"],
        yMax: 100,
        yUnit: "% retained",
      },
      {
        type: "barCategorical",
        title: "RETENTION CAMPAIGN SEND VOLUME vs OPEN RATE",
        bars: [
          { label: "Win-back email", value: 22, color: "#4fc3f7" },
          { label: "At-risk SMS", value: 34, color: "#fbbf24" },
          { label: "Loyalty offer email", value: 18, color: "#4ade80" },
          { label: "Pause incentive", value: 28, color: "#fbbf24" },
        ],
        unit: "% open/response",
        yMax: 40,
      },
      {
        type: "barHorizontal",
        title: "RETENTION BUDGET ALLOCATION — Q1 2026 ($K)",
        bars: [
          { label: "Discount offers", value: 184, max: 200 },
          { label: "SMS platform", value: 62, max: 200 },
          { label: "Email platform + creative", value: 48, max: 200 },
          { label: "Loyalty reward cost", value: 124, max: 200 },
          { label: "Analytics/tooling", value: 22, max: 200 },
        ],
      },
    ],
    questions: [
      {
        q: "In one sentence, what is the story this dashboard is telling?",
        gold: "The retention metrics improved modestly — 90-day retention up 3pp, early churn down 2pp — but there is no holdout group, which means we cannot determine whether this improvement is caused by the $440K retention investment or by seasonal patterns, product improvements, or organic behavior change that would have occurred without the campaigns.",
      },
      {
        q: "What is anomalous or unexpected in this data?",
        gold: "The KPI dashboard shows the fourth metric, Incremental Retention Lift, as 'Unclear — No holdout test running.' This is the most important number on the dashboard and it's missing. The 3pp retention improvement looks positive, but it's being compared to a historical benchmark, not a concurrent control group. If the product team made a UX improvement in Q4 that reduced friction, or if Q1 seasonally retains better than Q3, the entire 3pp gain could be unrelated to the $440K spend. Running a 12-month retention program without a holdout group is the most common mistake in lifecycle marketing.",
      },
      {
        q: "What would you ask next? Name the one piece of data you would pull before the meeting.",
        gold: "Implement a holdout group immediately for Q2 — even 10% of the at-risk population excluded from retention campaigns — so that by Q3 we have an apples-to-apples comparison. For the CMO meeting this quarter, pull the retention rate trend for customers who received zero retention touches in Q1 (self-identified holdouts who unsubscribed from marketing emails or were missed due to data issues) and compare to the treated group. If untreated customers retained at 37% and treated at 40%, the incremental lift is real but modest. If they retained at 40% too, the program isn't adding value at any cost.",
      },
    ],
  },
  {
    id: "product-1",
    domain: "product",
    title: "Product Health Dashboard — Mobile Consumer App",
    subtitle: "Week of May 4, 2026 vs trailing 4-week average",
    scenario: "You are the product analyst at a consumer mobile app (daily habit product — think journaling, fitness tracking, or language learning). The Head of Product just messaged: 'Our weekly metrics dropped and I need to understand why before the all-hands tomorrow.' You have 15 minutes.",
    kpis: [
      { label: "DAU", value: "284,210", delta: "▼ 18.4%", up: false },
      { label: "DAU/MAU (STICKINESS)", value: "31%", delta: "▼ 8pp vs avg", up: false },
      { label: "D7 RETENTION (NEW USERS)", value: "22%", delta: "▼ 9pp vs avg", up: false },
      { label: "CORE ACTION COMPLETION", value: "58%", delta: "▼ 14pp vs avg", up: false },
    ],
    charts: [
      {
        type: "lineMulti",
        title: "DAU BY PLATFORM — LAST 6 WEEKS",
        series: [
          { label: "iOS", color: "#f87171", points: [142, 144, 140, 141, 88, 84] },
          { label: "Android", color: "#4ade80", points: [138, 140, 142, 139, 141, 140] },
          { label: "Web", color: "#4fc3f7", points: [22, 23, 22, 24, 23, 22] },
        ],
        xLabels: ["W1", "W2", "W3", "W4", "W5", "W6"],
        yMax: 160,
        yUnit: "K",
      },
      {
        type: "barCategorical",
        title: "CORE ACTION COMPLETION BY PLATFORM — THIS WEEK",
        bars: [
          { label: "Android", value: 71, color: "#4ade80" },
          { label: "Web", value: 68, color: "#4fc3f7" },
          { label: "iOS", value: 32, color: "#f87171" },
        ],
        unit: "%",
        yMax: 85,
      },
      {
        type: "barHorizontal",
        title: "D7 RETENTION BY ACQUISITION COHORT — NEW USERS THIS WEEK",
        bars: [
          { label: "Android — organic", value: 34, max: 40 },
          { label: "Android — paid", value: 28, max: 40 },
          { label: "iOS — organic", value: 21, max: 40 },
          { label: "iOS — paid", value: 18, max: 40 },
        ],
      },
    ],
    questions: [
      {
        q: "In one sentence, what is the story this dashboard is telling?",
        gold: "The DAU drop and core action completion decline are iOS-only problems — Android and Web are stable — which means this is almost certainly a platform-specific bug introduced by an iOS release, not a product-wide engagement issue.",
      },
      {
        q: "What is anomalous or unexpected in this data?",
        gold: "Android core action completion at 71% is within normal range and DAU is flat, while iOS completion dropped to 32% (less than half of Android) and iOS DAU dropped 38% week-over-week. The magnitude and platform-specificity of the iOS drop is too sharp and too concentrated to be behavioral — a product release, App Store change, or iOS-specific bug is the overwhelmingly likely cause. D7 retention for iOS new users (18-21%) is also below Android (28-34%), suggesting the iOS experience has been worse for longer than just this week.",
      },
      {
        q: "What would you ask next? Name the one piece of data you would pull before the meeting.",
        gold: "Pull the iOS app version distribution this week vs last week and map it against the DAU drop timing. If a new iOS build shipped mid-week and the drop correlates precisely with the rollout timing, we have a confirmed bug. The fix recommendation is an immediate rollback or hotfix, not a product strategy conversation — and the all-hands narrative changes from 'our metrics are down' to 'we caught an iOS bug and here's the remediation plan.'",
      },
    ],
  },
  {
    id: "product-2",
    domain: "product",
    title: "Feature Launch Dashboard — Search v2.0",
    subtitle: "30-day post-launch analysis",
    scenario: "You are the product analyst at a SaaS platform. The Search v2.0 feature launched 30 days ago after 4 months of development. The product team is in the ship/iterate/kill decision meeting and needs your analysis to make the call.",
    kpis: [
      { label: "FEATURE ADOPTION RATE", value: "28%", delta: "Target was 40% at Day 30", up: false },
      { label: "WEEKLY ACTIVE USERS (FEATURE)", value: "61%", delta: "Of adopters", up: true },
      { label: "TIME SPENT IN SEARCH (AVG)", value: "4.2 min/session", delta: "▲ 1.8 min vs v1", up: true },
      { label: "SUPPORT TICKETS (SEARCH)", value: "2.8 per 1K users", delta: "▼ 1.2 vs v1 launch", up: true },
    ],
    charts: [
      {
        type: "lineMulti",
        title: "SEARCH v2 ADOPTION CURVE — DAILY (% OF ELIGIBLE USERS)",
        series: [
          { label: "Target curve", color: "#4fc3f7", points: [5, 10, 15, 20, 25, 30, 34, 38, 40] },
          { label: "Actual adoption", color: "#fbbf24", points: [4, 8, 12, 16, 18, 20, 22, 24, 28] },
        ],
        xLabels: ["D3", "D7", "D10", "D14", "D17", "D21", "D24", "D28", "D30"],
        yMax: 45,
        yUnit: "%",
      },
      {
        type: "barCategorical",
        title: "ADOPTION RATE BY USER SEGMENT — DAY 30",
        bars: [
          { label: "Power users (top 10%)", value: 68, color: "#4ade80" },
          { label: "Regular users", value: 31, color: "#4fc3f7" },
          { label: "Casual users (bottom 40%)", value: 8, color: "#f87171" },
        ],
        unit: "%",
        yMax: 80,
      },
      {
        type: "barHorizontal",
        title: "ADOPTION ENTRY POINT — HOW USERS DISCOVERED SEARCH v2",
        bars: [
          { label: "In-product tooltip", value: 48, max: 60 },
          { label: "Email announcement", value: 28, max: 60 },
          { label: "Organic discovery", value: 16, max: 60 },
          { label: "Help center article", value: 8, max: 60 },
        ],
      },
    ],
    questions: [
      {
        q: "In one sentence, what is the story this dashboard is telling?",
        gold: "Search v2 missed its 30-day adoption target by 12pp but the quality signals are strong — adopters use it weekly at 61%, spend significantly more time in search, and generate fewer support tickets — which means the problem is discoverability, not product value.",
      },
      {
        q: "What is anomalous or unexpected in this data?",
        gold: "Power user adoption at 68% is more than double casual user adoption at 8% — an unusually large gap that suggests the feature's value proposition resonates strongly with heavy users who are actively looking for better search, while casual users who might benefit from search improvement aren't finding or using it. Combined with 48% of discovery happening via tooltip (an active, in-product prompt) vs. 16% via organic discovery, the feature clearly needs better passive discoverability. Users who encounter it are using it — users who haven't encountered it aren't looking.",
      },
      {
        q: "What would you ask next? Name the one piece of data you would pull before the meeting.",
        gold: "Pull the retention-within-feature metric: of the 28% who adopted Search v2, what percentage used it in week 4 vs. week 1. If week 4 usage is 80%+ of week 1 adopters (high feature retention), the product is working and adoption just needs discoverability investment. If week 4 usage is 40% of week 1 adopters, users tried it and reverted to v1 behavior — the adoption number is inflating what's actually a value problem. That distinction changes the ship/iterate recommendation entirely.",
      },
    ],
  },
  {
    id: "product-3",
    domain: "product",
    title: "Retention Cohort Analysis Dashboard",
    subtitle: "Q1 2026 acquisition cohorts, 90-day view",
    scenario: "You are the growth analyst at a B2C subscription app. The CEO has called an emergency meeting after seeing that the latest user cohorts are retaining worse than previous cohorts. He's worried the product has peaked. You have 20 minutes to prep your read.",
    kpis: [
      { label: "D30 RETENTION (Q1 COHORTS)", value: "34%", delta: "▼ 8pp vs Q3 2025 cohorts", up: false },
      { label: "D7 RETENTION (Q1 COHORTS)", value: "48%", delta: "▼ 5pp vs Q3 2025 cohorts", up: false },
      { label: "NEW USER VOLUME (Q1)", value: "142K", delta: "▲ 38% vs Q3 2025", up: true },
      { label: "PAID ACQUISITION MIX (Q1)", value: "71%", delta: "▲ 28pp vs Q3 2025", up: false },
    ],
    charts: [
      {
        type: "lineMulti",
        title: "D30 RETENTION BY ACQUISITION COHORT — QUARTERLY",
        series: [
          { label: "Q1 2025 cohort", color: "#4ade80", points: [100, 62, 48, 42] },
          { label: "Q3 2025 cohort", color: "#4fc3f7", points: [100, 58, 44, 42] },
          { label: "Q1 2026 cohort", color: "#f87171", points: [100, 48, 34, null] },
        ],
        xLabels: ["D0", "D7", "D30", "D90"],
        yMax: 100,
        yUnit: "% retained",
      },
      {
        type: "barCategorical",
        title: "D30 RETENTION BY ACQUISITION SOURCE — Q1 2026",
        bars: [
          { label: "Organic/SEO", value: 51, color: "#4ade80" },
          { label: "Referral", value: 48, color: "#4ade80" },
          { label: "App Store", value: 42, color: "#4fc3f7" },
          { label: "Paid Social", value: 28, color: "#f87171" },
          { label: "Influencer", value: 22, color: "#f87171" },
        ],
        unit: "%",
        yMax: 60,
      },
      {
        type: "barHorizontal",
        title: "Q1 2026 USER ACQUISITION CHANNEL MIX (%)",
        bars: [
          { label: "Paid Social", value: 48, max: 60 },
          { label: "Influencer", value: 23, max: 60 },
          { label: "App Store (organic)", value: 18, max: 60 },
          { label: "Referral", value: 7, max: 60 },
          { label: "SEO/Direct", value: 4, max: 60 },
        ],
      },
    ],
    questions: [
      {
        q: "In one sentence, what is the story this dashboard is telling?",
        gold: "Q1 retention looks worse than prior cohorts, but it's almost entirely explained by the channel mix shift — paid social and influencer acquisition grew from 43% to 71% of new users, and those channels have structurally lower retention (22-28%) compared to organic and referral (48-51%), dragging the blended average down without the product itself having changed.",
      },
      {
        q: "What is anomalous or unexpected in this data?",
        gold: "Organic/SEO and referral retention in Q1 (51% and 48%) is actually slightly above prior cohorts — the product itself is retaining slightly better for users who come through high-intent channels. The retention decline is 100% a channel-mix artifact. This is a critical distinction: the CEO's concern ('the product has peaked') is wrong — the growth team's channel strategy is importing structurally lower-quality users. The narrative for the CEO meeting should not be 'the product has a retention problem' but 'our acquisition channel mix has changed and here's what it's costing us.'",
      },
      {
        q: "What would you ask next? Name the one piece of data you would pull before the meeting.",
        gold: "Pull the LTV projection for paid social and influencer cohorts vs. organic cohorts, and compare it to the CAC for each channel. If paid social CAC is $18 and 30-day LTV is $12 (negative payback at that retention rate), the channel is destroying value. If organic CAC is $4 and 30-day LTV is $24, the growth team should be asked why 71% of Q1 budget went to the worst-performing channel rather than scaling the best-performing one. That's the CEO conversation that matters.",
      },
    ],
  },
  {
    id: "product-4",
    domain: "product",
    title: "Growth Accounting Dashboard",
    subtitle: "Monthly user base decomposition — Q1 2026",
    scenario: "You are the product analytics lead at a consumer tech company. The CFO wants to understand the 'quality' of DAU growth — whether the active user base is built on healthy retention or churn-and-replace dynamics. This dashboard decomposes the user base using growth accounting methodology.",
    kpis: [
      { label: "END OF PERIOD MAU", value: "2.84M", delta: "▲ 12% vs start of Q1", up: true },
      { label: "NEW USERS (Q1)", value: "840K", delta: "Strong acquisition", up: true },
      { label: "CHURNED USERS (Q1)", value: "720K", delta: "25% of starting MAU", up: false },
      { label: "RESURRECTED USERS (Q1)", value: "180K", delta: "Re-engaged churned users", up: true },
    ],
    charts: [
      {
        type: "barCategorical",
        title: "GROWTH ACCOUNTING — MONTHLY BREAKDOWN (K USERS)",
        bars: [
          { label: "New (acquired)", value: 840, color: "#4ade80" },
          { label: "Retained (kept)", value: 2160, color: "#4fc3f7" },
          { label: "Resurrected (returned)", value: 180, color: "#fbbf24" },
          { label: "Churned (lost)", value: 720, color: "#f87171" },
        ],
        unit: "K",
        yMax: 2400,
      },
      {
        type: "lineMulti",
        title: "MONTHLY CHURN RATE — ROLLING 6 MONTHS (%)",
        series: [
          { label: "Churn Rate", color: "#f87171", points: [18, 20, 21, 22, 24, 25] },
          { label: "New User Rate", color: "#4ade80", points: [22, 24, 26, 28, 28, 29] },
        ],
        xLabels: ["Oct", "Nov", "Dec", "Jan", "Feb", "Mar"],
        yMax: 35,
        yUnit: "% of MAU",
      },
      {
        type: "barHorizontal",
        title: "CHURNED USER TENURE DISTRIBUTION",
        bars: [
          { label: "< 30 days tenure", value: 48, max: 60 },
          { label: "30-90 days tenure", value: 28, max: 60 },
          { label: "90-180 days tenure", value: 14, max: 60 },
          { label: "> 180 days tenure", value: 10, max: 60 },
        ],
      },
    ],
    questions: [
      {
        q: "In one sentence, what is the story this dashboard is telling?",
        gold: "MAU is growing, but the growth is hiding a deteriorating retention problem — churn has climbed from 18% to 25% of MAU over 6 months while new user acquisition keeps the headline number rising, meaning the platform is running faster on an acquisition treadmill while the bucket leaks more every month.",
      },
      {
        q: "What is anomalous or unexpected in this data?",
        gold: "48% of churned users had less than 30 days of tenure — meaning nearly half the churn is early-lifecycle users who never found lasting value. This is an onboarding and activation problem, not a long-term engagement problem. Long-tenured users (>180 days) represent only 10% of churn, which means the product retains well once users are habituated — but it's failing at the onboarding stage where most users are being lost. The acquisition rate growing to 29% of MAU while churn hits 25% means the platform is barely staying ahead of the leak — a marginal acquisition slowdown would put MAU into decline.",
      },
      {
        q: "What would you ask next? Name the one piece of data you would pull before the meeting.",
        gold: "Pull the activation rate for the cohorts with the highest early churn (< 30 days). Specifically: what percentage of new users complete the defined activation milestone (first core action) before churning? If 70% of early churners never completed activation, the fix is onboarding — getting users to the 'aha moment' faster. If activation rates are healthy but early churn is still high, the product is delivering initial value but not creating a habit — a different problem entirely. This diagnosis determines whether the investment goes to onboarding UX or to habit-formation mechanics.",
      },
    ],
  },
  {
    id: "product-5",
    domain: "product",
    title: "Notification & Re-engagement Performance Dashboard",
    subtitle: "Q1 2026 push notification program analysis",
    scenario: "You are the growth analyst at a mobile app. The Head of Growth wants to evaluate the push notification program before the Q2 budget cycle. Notifications are the primary retention tool but there are concerns they may be doing more harm than good.",
    kpis: [
      { label: "PUSH NOTIFICATION CTR", value: "3.8%", delta: "▼ 2.1pp vs Q1 2025", up: false },
      { label: "OPT-OUT RATE (QTD)", value: "8.2%", delta: "▲ 3.4pp vs Q1 2025", up: false },
      { label: "7-DAY RE-ENGAGEMENT", value: "28%", delta: "Notif → session within 7 days", up: true },
      { label: "SESSION DEPTH (POST-NOTIF)", value: "1.4 actions", delta: "▼ 0.8 vs organic sessions", up: false },
    ],
    charts: [
      {
        type: "lineMulti",
        title: "PUSH CTR vs OPT-OUT RATE — MONTHLY",
        series: [
          { label: "CTR (%)", color: "#4fc3f7", points: [5.8, 5.4, 5.1, 4.8, 4.2, 3.8] },
          { label: "Opt-out Rate (%)", color: "#f87171", points: [4.8, 5.2, 5.8, 6.4, 7.2, 8.2] },
        ],
        xLabels: ["Oct", "Nov", "Dec", "Jan", "Feb", "Mar"],
        yMax: 12,
        yUnit: "%",
      },
      {
        type: "barCategorical",
        title: "CTR BY NOTIFICATION TYPE — Q1 2026",
        bars: [
          { label: "Personalized trigger", value: 8.4, color: "#4ade80" },
          { label: "Friend activity", value: 6.2, color: "#4ade80" },
          { label: "Achievement/milestone", value: 5.1, color: "#4fc3f7" },
          { label: "Daily reminder (generic)", value: 1.4, color: "#f87171" },
          { label: "Promotional", value: 0.8, color: "#f87171" },
        ],
        unit: "%",
        yMax: 10,
      },
      {
        type: "barHorizontal",
        title: "NOTIFICATION VOLUME BY TYPE — Q1 2026 (% of sends)",
        bars: [
          { label: "Daily reminder (generic)", value: 52, max: 60 },
          { label: "Promotional", value: 24, max: 60 },
          { label: "Achievement/milestone", value: 12, max: 60 },
          { label: "Friend activity", value: 8, max: 60 },
          { label: "Personalized trigger", value: 4, max: 60 },
        ],
      },
    ],
    questions: [
      {
        q: "In one sentence, what is the story this dashboard is telling?",
        gold: "76% of notifications are the lowest-performing types (generic daily reminders at 1.4% CTR and promotional at 0.8%), while the highest-performing types (personalized triggers at 8.4% CTR and friend activity at 6.2%) get only 12% of sends — the notification program is burning user patience on ineffective messages while underusing the mechanics that actually drive engagement.",
      },
      {
        q: "What is anomalous or unexpected in this data?",
        gold: "The inverse relationship between CTR and opt-out rate over 6 months is the most important signal: as CTR declines, opt-out accelerates — not at the same rate, but faster. This is the signature of notification fatigue: users who were mildly annoyed by notifications now actively removing them. Once a user opts out, they cannot be re-engaged via push. The program is not just underperforming, it's actively destroying a future re-engagement channel. Session depth post-notification at 1.4 actions vs 2.2 for organic sessions also means that even the 3.8% who click are doing almost nothing — the notifications are driving low-intent visits, not meaningful engagement.",
      },
      {
        q: "What would you ask next? Name the one piece of data you would pull before the meeting.",
        gold: "Pull the opt-out rate segmented by user tenure and notification type received in the 7 days before opt-out. If users who received 5+ generic daily reminders in a week opt out at 3× the rate of users who received 1-2 personalized triggers, the data makes a clear case: reduce generic reminder volume by 80%, reallocate those sends to personalized trigger logic, and monitor opt-out rate over 30 days. That's a Q2 experiment with a defensible hypothesis, not a budget conversation about cutting the whole program.",
      },
    ],
  },
];

// ── PROBLEM-TO-METRIC SCENARIOS (Mode 3) ───────────────────────────────────
// 38 scenarios across 5 domains. Each: business problem in plain English,
// gold-standard list of KPIs in priority order with diagnostic logic.

const PROBLEM_SCENARIOS = [
  // RETAIL / E-COMMERCE — 8 scenarios
  {
    id: "retail-p1", domain: "retail",
    problem: "Last quarter our DTC website's revenue grew 12%, but the CFO is asking why we're not profitable. What KPIs would you pull to investigate?",
    goldKPIs: [
      { kpi: "Gross Margin %", logic: "Revenue growth without margin tracking can hide cost inflation or discount-driven sales. This is the single most important first check." },
      { kpi: "Customer Acquisition Cost (CAC)", logic: "If CAC has risen faster than revenue grew, paid acquisition is eating the profit." },
      { kpi: "Return Rate", logic: "Returns hit revenue twice (refund + reverse logistics). High returns destroy reported revenue's profitability." },
      { kpi: "Discount Rate / Promotional Mix %", logic: "Heavy discounting drives top-line growth but compresses unit economics. A revenue-up margin-down quarter usually has a promo story." },
      { kpi: "LTV:CAC Ratio", logic: "Even at higher CAC, the business is fine if LTV is keeping pace. This validates whether the growth is sustainable or a sugar high." },
    ],
  },
  {
    id: "retail-p2", domain: "retail",
    problem: "Our checkout conversion rate dropped 18% week-over-week with no marketing changes. What do you check first?",
    goldKPIs: [
      { kpi: "Checkout Funnel Drop-off Rate by Step", logic: "Isolates whether the drop is at cart-to-checkout, shipping page, payment page, or confirmation. Each step has different root causes." },
      { kpi: "Site Performance / Page Load Time", logic: "A 1-second delay in checkout can drop conversion 7-10%. Often the silent culprit when nothing else changed." },
      { kpi: "Conversion Rate by Browser/Device", logic: "A failed JavaScript update or browser-specific bug shows up here as a sudden segment-specific drop." },
      { kpi: "Payment Method Approval Rate", logic: "If a payment gateway started declining a card type or 3DS challenge increased, conversion drops without traffic-quality changes." },
      { kpi: "Cart Abandonment Rate", logic: "Tells you if users are getting to cart but bailing during checkout, vs. not even trying — different problem, different fix." },
    ],
  },
  {
    id: "retail-p3", domain: "retail",
    problem: "Email revenue is flat YoY despite a 30% larger subscriber list. What's going on?",
    goldKPIs: [
      { kpi: "Open Rate Trend", logic: "Inflated by Apple Mail Privacy Protection since 2021, but a falling open rate on a growing list still signals deliverability or list-quality decay." },
      { kpi: "Click-Through Rate", logic: "More honest signal than open rate — if CTR is falling, the list is bigger but less engaged. Quality is decoupling from quantity." },
      { kpi: "Email List Engagement Rate by Cohort", logic: "Recent subscribers should outperform older cohorts. If they don't, the list-building program is acquiring weak leads." },
      { kpi: "Unsubscribe Rate", logic: "A growing unsub rate alongside list growth means the new subscribers aren't a fit — usually from aggressive lead-magnet acquisition." },
      { kpi: "Revenue per Email Sent", logic: "The bottom-line efficiency metric. If RPS is dropping while list size grows, the channel is becoming less efficient even if total revenue holds." },
    ],
  },
  {
    id: "retail-p4", domain: "retail",
    problem: "Returns are up 22% on a single SKU we launched 60 days ago. Diagnose.",
    goldKPIs: [
      { kpi: "Return Reason Code Mix", logic: "Differentiates between sizing/fit issues (product page problem), quality defects (sourcing problem), and 'not as described' (photography/copy problem). Each fix is different." },
      { kpi: "Return Rate by Customer Cohort", logic: "If returns are concentrated in first-time buyers, the product page is overselling. If repeat customers return at the same rate, it's a unit problem." },
      { kpi: "Customer Reviews Sentiment", logic: "Reviews capture root cause in the customer's own words 2-4 weeks before return rate moves enough to be statistically significant." },
      { kpi: "Photos vs Product Mismatch Score (qualitative)", logic: "A return spike on a product where the photo doesn't represent the actual item is a content problem, not a product problem." },
      { kpi: "Sell-Through Rate alongside Return Rate", logic: "High sell-through + high return = strong demand for a flawed product. Low sell-through + high return = weak product-market fit. Different recommendations." },
    ],
  },
  {
    id: "retail-p5", domain: "retail",
    problem: "Customer Lifetime Value is flat over 18 months despite multiple retention campaigns. Why?",
    goldKPIs: [
      { kpi: "Repeat Purchase Rate by Cohort", logic: "LTV is mostly a function of repeat rate — if it's not moving, retention campaigns aren't actually retaining." },
      { kpi: "Time-to-Second-Purchase Distribution", logic: "Reveals whether retention is failing at the second purchase (the hardest to win) or later. Different campaigns address different points." },
      { kpi: "Average Order Frequency", logic: "Customers buying the same number of times means retention isn't degrading, but it isn't growing either. May signal saturation or wrong category." },
      { kpi: "Cross-Sell Rate / Category Penetration", logic: "If LTV is flat, customers are buying the same things at the same rate. Cross-sell expansion (new categories) is the typical growth lever." },
      { kpi: "Churn Rate by Cohort", logic: "Even if average LTV is flat, churn moving in opposite directions across cohorts can hide problems — recent cohorts may be churning faster while older cohorts mature." },
    ],
  },
  {
    id: "retail-p6", domain: "retail",
    problem: "Inventory carrying costs are up 35% YoY but stockouts are also up. What's broken?",
    goldKPIs: [
      { kpi: "Inventory Turnover by SKU", logic: "Identifies which SKUs have grown stale (slow turn = high carrying cost) and which are turning fast (potential stockouts)." },
      { kpi: "Days of Inventory on Hand", logic: "Days on hand that exceed lead time signals overstock; days on hand below lead time signal stockout risk. Both can rise simultaneously across different SKUs." },
      { kpi: "Forecast Accuracy (MAPE) by Category", logic: "Both overstock and stockouts trace back to forecast misses in different directions. MAPE shows where forecasts are systematically wrong." },
      { kpi: "Sell-Through Rate by Receipt Cohort", logic: "Distinguishes new arrivals that aren't moving from base inventory that's accumulated. Different fixes — markdowns vs. SKU rationalization." },
      { kpi: "Stockout Rate by SKU Velocity Tier", logic: "Stockouts on A-velocity items are more costly than stockouts on C-velocity items. Aggregate stockout rate hides this." },
    ],
  },
  {
    id: "retail-p7", domain: "retail",
    problem: "Loyalty program members convert at 4.2% but the program ROI is negative. Explain.",
    goldKPIs: [
      { kpi: "Incremental Conversion Lift", logic: "The 4.2% is meaningless without comparing to what loyalty members would have converted at *anyway*. True ROI is the lift, not the absolute rate." },
      { kpi: "Cost of Loyalty Rewards Earned vs Redeemed", logic: "Earned but unredeemed liability is a balance sheet drag; high redemption is a P&L drag. Both kill ROI." },
      { kpi: "Discount Burden (% of Loyalty Sales)", logic: "Loyalty programs that rely on discounts compress margin on every loyalty transaction. The conversion gain may not cover the margin loss." },
      { kpi: "Repeat Purchase Rate: Members vs Non-Members (cohort-matched)", logic: "Apples-to-apples comparison adjusts for the self-selection bias that loyalty members are inherently higher-intent." },
      { kpi: "Customer Acquisition Cost via Loyalty Referral", logic: "If the program is supposed to reduce CAC through referrals, measure that directly. Otherwise the program is paying for retention twice." },
    ],
  },
  {
    id: "retail-p8", domain: "retail",
    problem: "Mobile traffic doubled last year but mobile revenue grew only 30%. What's happening on mobile?",
    goldKPIs: [
      { kpi: "Mobile Conversion Rate (vs Desktop)", logic: "Mobile typically converts 40-60% of desktop. If the gap is widening, traffic is lower-intent or the mobile experience is degrading." },
      { kpi: "Mobile Page Load Time", logic: "Mobile load time is the single biggest mobile conversion killer. A 4-second page on mobile vs 2-second on desktop explains huge conversion gaps." },
      { kpi: "Mobile Checkout Funnel Drop-off", logic: "Tiny form fields, missing autofill, 3DS challenges all hit mobile harder. Step-by-step drop-off shows where." },
      { kpi: "Mobile AOV vs Desktop AOV", logic: "Mobile users typically buy fewer items per order. If mobile revenue is lagging traffic, AOV gap is a contributor alongside conversion." },
      { kpi: "Mobile Bounce Rate by Landing Page", logic: "Identifies which landing pages are mobile-broken or mobile-unfriendly. Often a few specific pages are dragging the average." },
    ],
  },

  // HEALTHCARE — 8 scenarios
  {
    id: "hc-p1", domain: "healthcare",
    problem: "Our 30-day readmission rate climbed from 13% to 16% over six months. The CMS penalty risk is now real. Diagnose.",
    goldKPIs: [
      { kpi: "Readmission Rate by Primary Diagnosis (DRG)", logic: "Aggregate readmits hide condition-specific patterns. CHF, COPD, and pneumonia are the CMS-targeted conditions and usually drive the spike." },
      { kpi: "30-Day Post-Discharge Follow-Up Rate", logic: "The single most-evidence-based intervention against readmits. If follow-up rate dropped, readmits rise predictably." },
      { kpi: "Medication Reconciliation Rate at Discharge", logic: "Medication errors at transitions cause ~30% of preventable readmits. A drop here drives a readmit rise." },
      { kpi: "Average Length of Stay by DRG", logic: "Falling ALOS without supporting outpatient infrastructure pushes patients out unstable. ALOS-readmit tradeoff must be tracked together." },
      { kpi: "Discharge Disposition Mix (Home vs SNF vs Home Health)", logic: "If more patients are being discharged home without home health that previously went to SNF, readmits rise. Often a payer-driven change." },
    ],
  },
  {
    id: "hc-p2", domain: "healthcare",
    problem: "Days in AR has crept from 38 to 52 days. The CFO needs a root cause this week.",
    goldKPIs: [
      { kpi: "Initial Claim Denial Rate", logic: "Denials force resubmission cycles that extend AR days. The most common upstream cause of rising days in AR." },
      { kpi: "Denial Rate by Payer", logic: "If one payer drives the denial increase, the cause is contract/process, not internal billing. Different fix." },
      { kpi: "Denial Rate by Reason Code", logic: "Eligibility errors, prior auth missing, and coding errors all need different fixes. Reason code mix tells you which department to fix." },
      { kpi: "Clean Claim Rate", logic: "The leading indicator — claims submitted clean don't get denied. If clean claim rate dropped, denials and AR days will follow." },
      { kpi: "AR Aging Bucket Distribution", logic: "Days in AR is an average; aging buckets show whether the problem is more old claims (collection issue) or fewer fast-paid claims (payer slow-pay)." },
    ],
  },
  {
    id: "hc-p3", domain: "healthcare",
    problem: "ED door-to-provider time has doubled in three months. Why?",
    goldKPIs: [
      { kpi: "ED Volume Trend (visits per day)", logic: "Most basic check. If volume jumped 30%+ without staffing changes, capacity is the cause. Often the answer." },
      { kpi: "ED Boarding Time / Inpatient Bed Wait", logic: "When inpatient is full, ED becomes a holding tank. This downstream blockage is the most common door-to-provider driver." },
      { kpi: "Provider Staffing Hours per Patient Volume", logic: "If staffing didn't scale with volume, the metric must move. Compares budgeted to actual provider hours." },
      { kpi: "Triage Acuity Mix (ESI 1-5)", logic: "More high-acuity patients means longer per-patient time and longer waits for everyone. Acuity drift drives the metric without obvious volume change." },
      { kpi: "Left Without Being Seen (LWBS) Rate", logic: "When wait gets long enough, patients leave. LWBS rising alongside door-to-provider confirms the wait is past patient tolerance." },
    ],
  },
  {
    id: "hc-p4", domain: "healthcare",
    problem: "HCAHPS scores dropped 8 percentile points over two quarters. Where's the problem?",
    goldKPIs: [
      { kpi: "HCAHPS Domain-Level Scores", logic: "Composite drop hides the real story — usually 1-2 domains (Communication, Responsiveness, Quietness) drive the move. Domain-level isolates the cause." },
      { kpi: "Nurse Staffing Ratios", logic: "Communication and Responsiveness scores correlate strongly with nurse-to-patient ratios. A staffing change shows up in HCAHPS within a quarter." },
      { kpi: "Discharge Education Compliance Rate", logic: "The 'Care Transitions' HCAHPS domain tracks discharge experience. Often the easiest domain to move with a documented intervention." },
      { kpi: "Voluntary Survey Comments — Word Frequency", logic: "Unstructured feedback often reveals the operational change (new EHR, food vendor switch, parking changes) that quant metrics don't capture." },
      { kpi: "HCAHPS Response Rate", logic: "If response rate dropped, sample bias may explain the score change rather than actual experience. Methodology check before intervention." },
    ],
  },
  {
    id: "hc-p5", domain: "healthcare",
    problem: "Cost per discharge is up 11% year-over-year on the cardiac service line. Investigate.",
    goldKPIs: [
      { kpi: "Average Length of Stay (ALOS) — Cardiac", logic: "ALOS is the largest cost driver in inpatient care. A 0.5-day rise translates to a ~10% cost increase, matching the observed change." },
      { kpi: "Supply Cost per Case (cardiac implants, drugs)", logic: "Cardiac is implant-heavy. A device price increase or shift to higher-cost devices can drive cost per case independent of LOS." },
      { kpi: "Case-Mix Index (CMI) / Acuity Adjustment", logic: "If sicker patients shifted into the service line, cost rises appropriately. Cost should be evaluated *per CMI-adjusted case*, not raw." },
      { kpi: "Readmission Rate (cardiac)", logic: "Readmits add cost without DRG payment — the readmitted case is part of the original DRG bundle. Readmit rate increase translates to cost-per-discharge increase." },
      { kpi: "OR Time per Cardiac Procedure", logic: "Procedure time scales with cost (anesthesia, OR fixed cost). Surgeon-level OR time variation can drive aggregate cost." },
    ],
  },
  {
    id: "hc-p6", domain: "healthcare",
    problem: "Our health plan's Medicare Star Rating dropped from 4.0 to 3.5. We have one rating cycle to recover. Where do we focus?",
    goldKPIs: [
      { kpi: "HEDIS Measure Performance — Triple-Weighted Measures", logic: "CMS triple-weights certain measures (e.g., medication adherence). Moving these moves the rating most efficiently." },
      { kpi: "CAHPS Survey Domain Scores", logic: "Patient experience is a significant portion of the rating. CAHPS domains identify which experience improvements matter most." },
      { kpi: "Closing-Ratio on Care Gaps (HEDIS)", logic: "Members with open care gaps drag scores. Tracking how fast gaps close per outreach attempt shows where care management is or isn't moving the needle." },
      { kpi: "Medication Adherence (PDC) by Drug Class", logic: "Adherence is one of the highest-impact, most-actionable Star levers. Class-level breakdown identifies where adherence interventions work." },
      { kpi: "Provider Network Performance Variance", logic: "Some provider groups will be far below network average on quality measures. Targeting outreach to those groups is the highest-leverage action." },
    ],
  },
  {
    id: "hc-p7", domain: "healthcare",
    problem: "OR utilization is at 62% — well below the 80% target. The OR director wants to know why.",
    goldKPIs: [
      { kpi: "OR Block Utilization by Surgeon", logic: "Reserved blocks that aren't filled drag aggregate utilization. Surgeon-level breakdown shows whose blocks are underutilized." },
      { kpi: "First-Case On-Time Start Rate", logic: "Late starts cascade through the day, reducing total cases possible. Often the single biggest fixable utilization driver." },
      { kpi: "OR Turnover Time (case-to-case)", logic: "Long turnovers waste capacity. Each 10 minutes of turnover reduction can add a case per day per OR." },
      { kpi: "Case Cancellation Rate (and reasons)", logic: "Day-of cancellations leave block time empty. Cancellation reasons identify whether the cause is patient, surgeon, or supply chain (instruments missing)." },
      { kpi: "Block Release Lead Time", logic: "Blocks released 24+ hours in advance can be filled by other surgeons. Late releases create empty rooms." },
    ],
  },
  {
    id: "hc-p8", domain: "healthcare",
    problem: "Total joint replacement margin per case has dropped 15% in 12 months despite stable reimbursement. What's driving cost?",
    goldKPIs: [
      { kpi: "Implant Cost per Case", logic: "Implants are 40-60% of total joint case cost. Vendor price increases or surgeon preference shifts toward premium implants drive case cost." },
      { kpi: "Length of Stay (TKA/THA)", logic: "TJR has been moving from 3 days to outpatient. If your ALOS hasn't moved, you're carrying inpatient cost without reimbursement adjustment." },
      { kpi: "OR Time per Case (by Surgeon)", logic: "Per-minute OR cost is high. Surgeons with longer OR times drive case cost without proportional outcome benefit." },
      { kpi: "Readmission/Complication Rate (90-day)", logic: "Under bundled payment, post-discharge complications are absorbed by the hospital. Rising complications destroy margin under BPCI." },
      { kpi: "Discharge Disposition (Home vs Rehab/SNF)", logic: "Under bundled payment, post-acute care is part of the cost. Sending patients to SNF instead of home adds significant cost without revenue." },
    ],
  },

  // FINANCE — 7 scenarios
  {
    id: "fin-p1", domain: "finance",
    problem: "Our SaaS company's NRR dropped from 118% to 104% YoY. Walk me through what you'd investigate.",
    goldKPIs: [
      { kpi: "Gross Revenue Retention (GRR)", logic: "Decompose NRR into GRR + expansion. If GRR fell, churn is the issue. If GRR is stable, expansion is the issue. Different remediations." },
      { kpi: "Churn Rate by Customer Segment", logic: "Aggregate churn hides where the loss is. SMB churn vs enterprise churn require different interventions." },
      { kpi: "Expansion Revenue per Account", logic: "If existing customers stopped expanding, the upsell motion or product road map is the issue." },
      { kpi: "Net New ARR by Cohort", logic: "Recent cohorts may behave differently than older cohorts. If new cohorts churn faster or expand less, the sales-fit definition has drifted." },
      { kpi: "Logo vs Revenue Churn", logic: "Losing many small logos vs losing one big logo are very different stories. Both can produce the same NRR drop." },
    ],
  },
  {
    id: "fin-p2", domain: "finance",
    problem: "EPS beat estimates but the stock dropped 8% on earnings. Why might the market be reacting negatively?",
    goldKPIs: [
      { kpi: "Revenue Growth Rate", logic: "Beating EPS via cost cuts while missing revenue means unsustainable earnings quality. Markets reward growth quality over earnings beats." },
      { kpi: "Forward Guidance vs. Consensus", logic: "Past quarter beat is irrelevant if forward guidance is below expectations. Stocks trade on forward, not trailing." },
      { kpi: "Operating Margin Trend", logic: "Margin expansion via revenue (operating leverage) is good; margin via layoffs is suspect. The composition of the beat matters." },
      { kpi: "Free Cash Flow vs Net Income", logic: "EPS can be inflated by accruals or working capital changes. FCF divergence from EPS is a quality-of-earnings flag." },
      { kpi: "Same-Store / Organic Growth Rate", logic: "If the EPS beat came from acquisitions, organic growth may be deteriorating. Markets penalize acquisition-driven earnings." },
    ],
  },
  {
    id: "fin-p3", domain: "finance",
    problem: "Working capital has expanded 45% in 18 months while revenue grew 20%. Cash flow is tight. Diagnose.",
    goldKPIs: [
      { kpi: "Days Sales Outstanding (DSO)", logic: "If customers pay slower, AR grows faster than revenue. Often the largest single working capital drag." },
      { kpi: "Days Inventory Outstanding (DIO)", logic: "Inventory growth disproportionate to sales velocity ties up cash. Often a forecasting or sourcing problem." },
      { kpi: "Days Payable Outstanding (DPO)", logic: "If we're paying suppliers faster while customers pay slower, the cash gap widens. Symmetric movement is needed." },
      { kpi: "Cash Conversion Cycle (DIO + DSO − DPO)", logic: "The composite metric — captures working capital health in one number. The trend tells you whether it's getting structurally worse." },
      { kpi: "AR Aging Bucket Distribution", logic: "Average DSO may not show the problem if a few large accounts are aging. The 90+ bucket reveals real collection risk." },
    ],
  },
  {
    id: "fin-p4", domain: "finance",
    problem: "Our P/E ratio expanded from 18× to 28× over a year while earnings only grew 5%. What's the market saying?",
    goldKPIs: [
      { kpi: "Forward Earnings Estimates Trend", logic: "Multiple expansion usually means analysts are raising forward estimates. The market is paying for expected future earnings, not trailing." },
      { kpi: "Sector P/E Comparison", logic: "If the whole sector re-rated, our multiple expansion is market-wide, not company-specific. Different story." },
      { kpi: "Earnings Quality (FCF / Net Income)", logic: "If earnings quality improved (more cash-backed), markets appropriately pay more. Stable ratio means quality didn't change — just sentiment." },
      { kpi: "Revenue Growth Acceleration", logic: "Markets pay premium multiples for accelerating growth. Even with 5% EPS, accelerating revenue can drive P/E expansion." },
      { kpi: "Beta and Volatility Trend", logic: "Lower volatility / lower beta companies command higher multiples. A re-rating from cyclical to defensive can drive multiple expansion." },
    ],
  },
  {
    id: "fin-p5", domain: "finance",
    problem: "A potential acquisition target has 30% revenue growth and 5% EBITDA margins. The CFO is skeptical. What should you check?",
    goldKPIs: [
      { kpi: "Unit Economics (Contribution Margin per Customer)", logic: "Low EBITDA with high growth can be either 'investing in scale' or 'fundamentally unprofitable.' Unit economics distinguishes them." },
      { kpi: "CAC Payback Period", logic: "If CAC payback exceeds 24 months, the growth requires perpetual capital infusion. A red flag for acquisition targets." },
      { kpi: "Gross Margin Trend", logic: "Stable gross margin under high growth = scalable model. Compressing gross margin under high growth = price competition." },
      { kpi: "Working Capital Trend", logic: "High-growth companies often have negative working capital pulls (collecting from customers before paying suppliers) — or the opposite, which signals structural issues." },
      { kpi: "Revenue Concentration (Top 10 Customers %)", logic: "30% revenue growth on a concentrated customer base is fragile. Loss of one large customer ends the growth story." },
    ],
  },
  {
    id: "fin-p6", domain: "finance",
    problem: "Our debt-to-equity ratio doubled in two years while the share price dropped. The board is asking whether we're at risk of distress.",
    goldKPIs: [
      { kpi: "Interest Coverage Ratio (EBIT / Interest Expense)", logic: "The most direct measure of debt service capacity. Below 1.5× is dangerous; below 1.0× means we can't cover interest from operations." },
      { kpi: "Debt Maturity Schedule", logic: "The risk isn't total debt — it's near-term refinancing. A wall of maturities in 18 months is more dangerous than a 10-year amortization." },
      { kpi: "Free Cash Flow vs. Required Debt Service", logic: "FCF must cover debt service plus minimum reinvestment. If FCF margin shrinks below this floor, distress accelerates." },
      { kpi: "Liquidity (Cash + Revolver Capacity)", logic: "Even insolvent businesses can survive a long time with liquidity. Liquidity is the bridge to recovery; without it, distress accelerates fast." },
      { kpi: "Covenant Headroom", logic: "Most leveraged companies fail when debt covenants trip — not when interest goes unpaid. Headroom on leverage and coverage covenants is the early warning." },
    ],
  },
  {
    id: "fin-p7", domain: "finance",
    problem: "Cash from operations dropped 25% but net income only dropped 5%. Investors are concerned about earnings quality. Why might this be happening?",
    goldKPIs: [
      { kpi: "Working Capital Change Components", logic: "AR growth, inventory growth, or AP shrinkage all consume cash without affecting net income. The largest culprits in CFO/NI gaps." },
      { kpi: "Days Sales Outstanding Trend", logic: "If DSO is growing, more revenue is being booked but not collected — net income reflects accrual revenue, CFO reflects only cash." },
      { kpi: "Inventory Buildup vs Sales Trend", logic: "Building inventory without selling it inflates COGS deferral but ties up cash. A common quality-of-earnings issue." },
      { kpi: "Non-Cash Charges (Stock-Based Comp, Depreciation)", logic: "Higher non-cash charges add to the CFO/NI gap on the cash side, not the negative side. Verifies whether the gap is structural or distortion." },
      { kpi: "Deferred Revenue Movement", logic: "For subscription businesses, deferred revenue swings move cash without moving income. A drop in new bookings shows in cash before income." },
    ],
  },

  // OPERATIONS / SUPPLY CHAIN — 8 scenarios
  {
    id: "ops-p1", domain: "operations",
    problem: "On-time delivery has fallen from 96% to 88% over six months across our network. The CEO is escalating. Diagnose.",
    goldKPIs: [
      { kpi: "OTD by Lane / Distribution Center", logic: "Network-aggregate OTD masks where the problem is. One DC or one lane usually drives the metric. Targeting that node is the leverage point." },
      { kpi: "Late-Delivery Root Cause Mix", logic: "Stockouts, carrier delays, system outages, and labor each have different fixes. Aggregate OTD doesn't tell you which fix to apply." },
      { kpi: "Order Cycle Time (Order-to-Ship)", logic: "If orders are taking longer to leave the dock, OTD will degrade even if transit times are stable. Internal cycle is often the controllable lever." },
      { kpi: "Carrier Performance Scorecards", logic: "External carriers may be the actual cause. If transit time variance jumped, the issue isn't your operation." },
      { kpi: "Forecast Accuracy / Stockout Rate", logic: "Stockouts cause the most unrecoverable late deliveries. If forecast accuracy dropped, the problem is upstream of execution." },
    ],
  },
  {
    id: "ops-p2", domain: "operations",
    problem: "Our manufacturing OEE dropped from 75% to 62% on the main production line. What do you check?",
    goldKPIs: [
      { kpi: "OEE Component Breakdown (Availability × Performance × Quality)", logic: "OEE drop has three possible causes. Knowing which component fell tells you whether to investigate breakdowns, speed losses, or defects." },
      { kpi: "Unplanned Downtime by Cause", logic: "If Availability dropped, breakdowns are the cause. Cause codes (mechanical, electrical, supply) point to the right team to involve." },
      { kpi: "Cycle Time vs Standard", logic: "If Performance dropped, the line is running slower than designed. Causes: untrained operators, material flow issues, maintenance neglect." },
      { kpi: "First-Pass Yield Trend", logic: "If Quality dropped, defects are eating capacity. Inspection or rework data identifies the failure mode." },
      { kpi: "Maintenance Schedule Compliance", logic: "Skipped preventive maintenance is the most common slow-burn OEE killer. Compliance trend predicts breakdown rate 2-3 months ahead." },
    ],
  },
  {
    id: "ops-p3", domain: "operations",
    problem: "Inventory turnover dropped from 8× to 5× over a year. The CFO is asking why we're holding so much stock.",
    goldKPIs: [
      { kpi: "Inventory by Velocity Tier (A/B/C)", logic: "Aggregate turnover can fall because slow-mover (C-velocity) inventory is accumulating while A-items turn fine. Different fix per tier." },
      { kpi: "Forecast Accuracy (MAPE) by Category", logic: "Bad forecasts produce overstocks. The categories with the largest forecast error usually contribute most to inventory buildup." },
      { kpi: "Sell-Through Rate by Receipt Cohort", logic: "If recent receipts aren't selling at expected rates, demand assumptions were wrong. Cohort-level data reveals when the demand shift happened." },
      { kpi: "Aging Inventory %", logic: "Inventory aging past 180 days is essentially dead weight. The accumulation rate predicts future markdowns and write-offs." },
      { kpi: "Safety Stock Levels vs Demand Variability", logic: "Safety stock tied to old demand variability assumptions can become bloated. Recalibrating to current variability often releases significant cash." },
    ],
  },
  {
    id: "ops-p4", domain: "operations",
    problem: "Our recordable incident rate (TRIR) doubled in 12 months. Investigate the safety culture.",
    goldKPIs: [
      { kpi: "Incident Rate by Department / Shift", logic: "Aggregate TRIR hides hot spots. One shift, one department, or one supervisor often drives the increase." },
      { kpi: "Near-Miss Reporting Rate", logic: "If incidents are up but near-miss reporting fell, the safety culture is weakening — people are getting hurt without prior reporting that should have prevented it." },
      { kpi: "Severity-Weighted Incident Rate (DART)", logic: "TRIR weights all recordables equally. DART tells you whether the increase is in minor or serious incidents — different urgency." },
      { kpi: "New-Hire Incident Rate", logic: "New employees are 3-5× more likely to have incidents. If hiring grew, baseline incident rate rises mechanically — not a culture problem." },
      { kpi: "Time Since Last Incident Trends by Crew", logic: "Safety culture metrics deteriorate when crews lose their 'streak.' Tracking by crew identifies which teams need re-engagement." },
    ],
  },
  {
    id: "ops-p5", domain: "operations",
    problem: "Supplier on-time delivery from our top supplier dropped from 98% to 84%. They claim it's our forecast. Investigate.",
    goldKPIs: [
      { kpi: "Forecast Accuracy / MAPE for Items from This Supplier", logic: "If our forecast variability rose, supplier production planning suffers. Their claim may be valid — verify with our own data." },
      { kpi: "Order Volume Variance (Actual vs Forecasted)", logic: "Even if MAPE looks normal, large absolute volume swings strain supplier capacity. Variance, not just average error, matters." },
      { kpi: "Order Lead Time Adherence", logic: "If we shortened lead times without informing the supplier, they can't plan production accordingly. Lead time changes are often the silent cause." },
      { kpi: "Supplier Capacity Utilization (where visible)", logic: "If the supplier is at 95%+ capacity utilization, they have no buffer for forecast errors. They may be telling the truth that forecasts caused the issue — but capacity is the constraint." },
      { kpi: "Order Mix Stability (SKU Mix vs Forecast)", logic: "Even with stable total volume, mix shifts to harder-to-produce SKUs reduces effective capacity. Mix variance is often hidden in volume variance analysis." },
    ],
  },
  {
    id: "ops-p6", domain: "operations",
    problem: "Cost per order shipped is up 18% YoY. We're losing margin on every transaction. Where do you look?",
    goldKPIs: [
      { kpi: "Freight Cost per Order", logic: "Carrier rate increases or modal shifts (more air, less ocean) drive freight cost. Often the largest single component of cost-per-order changes." },
      { kpi: "Labor Productivity (Units per Labor Hour)", logic: "If productivity fell, labor cost per unit rises. Wage rates can be stable while cost rises through productivity decay." },
      { kpi: "Order Mix (Units per Order)", logic: "Smaller orders are more expensive per unit. A shift toward smaller order sizes raises cost per order without anything else changing." },
      { kpi: "Returns Cost (Reverse Logistics)", logic: "Returns are usually accounted for at a higher cost per unit than outbound. Rising return rates inflate effective cost per net order shipped." },
      { kpi: "Packaging Material Cost per Order", logic: "Packaging is typically 8-15% of fulfillment cost. Material price increases or oversized packaging usage adds up fast." },
    ],
  },
  {
    id: "ops-p7", domain: "operations",
    problem: "Forecast accuracy (MAPE) is at 38%. Demand planning leadership wants to know where to invest first to improve.",
    goldKPIs: [
      { kpi: "MAPE by Product Velocity Tier (A/B/C)", logic: "C-velocity items will always have high MAPE due to low volume. A-velocity items with high MAPE are the actual problem and the best ROI to fix." },
      { kpi: "MAPE by Channel", logic: "DTC, wholesale, and B2B forecasts have different drivers. Channel-level MAPE shows which channel's forecasting needs the most work." },
      { kpi: "Forecast Bias (signed error)", logic: "MAPE is unsigned. Bias tells you whether you systematically over-forecast or under-forecast. Each requires opposite fixes." },
      { kpi: "Forecast Cycle Length / Frequency", logic: "Monthly forecasts on weekly demand patterns will be wrong. Cycle alignment with the planning horizon matters more than algorithm sophistication." },
      { kpi: "Promotional Volume Predictability", logic: "Most forecast errors come from promotions — base demand is usually predictable. If promo lift assumptions are off, MAPE spikes during promo periods." },
    ],
  },
  {
    id: "ops-p8", domain: "operations",
    problem: "Warehouse productivity (units per labor hour) has been declining for 8 weeks. Throughput is down. Why?",
    goldKPIs: [
      { kpi: "Productivity by Shift / Team", logic: "Aggregate productivity hides team-level variance. A new team or shift often drives the average down without affecting others." },
      { kpi: "Order Mix Profile (Single-Line vs Multi-Line)", logic: "If order profile shifted toward more multi-line orders, picking time per order rises mechanically. Productivity per unit may be fine; productivity per order has dropped." },
      { kpi: "New-Hire Mix in Workforce", logic: "New hires are 30-50% slower than experienced workers for 60-90 days. Hiring surges drag aggregate productivity for a quarter or more." },
      { kpi: "Equipment Downtime Rate", logic: "Conveyor or scanner outages cause cascading slowdowns that don't always show as 'downtime' in primary tracking. Side-effect productivity drops are common." },
      { kpi: "Pick Path Efficiency (Travel Time per Pick)", logic: "Slotting issues — high-velocity items in suboptimal locations — increase travel time per pick. The single most common warehouse productivity killer." },
    ],
  },

  // MARKETING — 7 scenarios
  {
    id: "mkt-p1", domain: "marketing",
    problem: "Blended ROAS dropped from 3.2× to 1.9× over the past year despite the same spend mix. Investigate.",
    goldKPIs: [
      { kpi: "ROAS by Channel", logic: "Blended ROAS hides channel-level dynamics. One channel deteriorating can drag the whole mix. Channel-level isolates the cause." },
      { kpi: "CAC by Channel", logic: "If CAC rose without LTV rising, ROAS falls. Channel-level CAC trend reveals which channel is becoming inefficient." },
      { kpi: "Channel Saturation (Frequency)", logic: "Diminishing returns kick in at high frequency. If a channel scaled up without expanding audience, ROAS naturally decays." },
      { kpi: "Attribution Model Comparison (Last-Click vs MTA)", logic: "ROAS depends heavily on attribution. If attribution methodology shifted, the metric changed without underlying performance changing." },
      { kpi: "Conversion Rate by Channel (Post-Click)", logic: "Lower conversion on the same traffic means landing pages or offers are underperforming. Channel-level conversion isolates where the leak is." },
    ],
  },
  {
    id: "mkt-p2", domain: "marketing",
    problem: "Email open rates have fallen from 32% to 19% in 18 months. Diagnose.",
    goldKPIs: [
      { kpi: "Open Rate by List Cohort / Acquisition Source", logic: "Apple MPP affects all senders equally. Cohort-level analysis isolates list-quality decay from MPP-driven distortion." },
      { kpi: "Sender Reputation Score", logic: "Domain reputation degradation moves emails to spam folders, dropping opens regardless of subject line. The most common silent cause." },
      { kpi: "List Hygiene (Hard Bounce Rate, Unengaged Subscribers)", logic: "Stale list segments lower deliverability. Aggressive list growth without sunset policies kills open rates over 12-18 months." },
      { kpi: "Subject Line Performance Trend", logic: "If subject lines became formulaic or got longer, opens decay. A/B testing data shows whether creative is the issue." },
      { kpi: "Send Frequency vs Engagement", logic: "Increased send frequency erodes engagement. Frequency-vs-opens curve shows the optimal cadence — past that point, opens drop." },
    ],
  },
  {
    id: "mkt-p3", domain: "marketing",
    problem: "Lead volume is up 40% but our sales team says the leads are worse. They're closing fewer. Investigate.",
    goldKPIs: [
      { kpi: "MQL-to-SQL Conversion Rate", logic: "If marketing volume grew but sales-qualified rate dropped, MQL definition has drifted or sources changed. The key efficiency metric." },
      { kpi: "SQL-to-Close Conversion Rate", logic: "Decomposes the funnel further. If MQL-to-SQL is fine but SQL-to-close fell, lead intent is lower even after qualification." },
      { kpi: "Lead Source Mix", logic: "If new lead sources entered the mix (paid lead gen, content downloads), they often convert lower than referral or demo-request leads." },
      { kpi: "Average Deal Size by Source", logic: "Even if close rate is lower, higher deal size can compensate. Source-level deal size shows whether quality dropped or just changed shape." },
      { kpi: "Sales Cycle Length by Source", logic: "If new sources have longer cycles, current quarter close rate can lag without lead quality being worse — just slower." },
    ],
  },
  {
    id: "mkt-p4", domain: "marketing",
    problem: "Organic search traffic dropped 30% in 60 days. SEO team is panicking. Where do you start?",
    goldKPIs: [
      { kpi: "Traffic by Landing Page (Top 50)", logic: "Aggregate drop hides whether all pages dropped or a few specific pages. Concentrated drops point to specific algorithm signals." },
      { kpi: "Keyword Ranking Movements", logic: "If specific keywords dropped, the algorithm change targeted those topics. Ranking data identifies what Google deprioritized." },
      { kpi: "Click-Through Rate from Search Results", logic: "Some traffic drops come from CTR drops, not ranking drops — SERP changes (featured snippets, AI overviews) reduce clicks even at the same rank." },
      { kpi: "Crawl/Index Coverage (Search Console)", logic: "Technical SEO issues (de-indexing, robots.txt mistakes) cause sudden traffic drops. Always verify the site is being indexed normally." },
      { kpi: "Content Freshness / Last Update Date", logic: "Algorithm updates often penalize stale content. Pages that haven't been updated in 18+ months are vulnerable in any major update." },
    ],
  },
  {
    id: "mkt-p5", domain: "marketing",
    problem: "We launched a brand campaign with a $500K budget. Six months later, ROI is unclear. How would you measure it?",
    goldKPIs: [
      { kpi: "Brand Awareness Lift (Survey-Based)", logic: "Brand campaigns are measured on awareness, not direct conversion. Pre/post brand surveys are the gold standard outcome metric." },
      { kpi: "Branded Search Volume", logic: "When awareness grows, branded searches grow. Trending Google Search Console data is a free, near-real-time proxy for brand impact." },
      { kpi: "Direct Traffic Trend", logic: "Brand awareness drives direct traffic. A direct traffic lift in the campaign window is supporting evidence." },
      { kpi: "Share of Voice", logic: "Even if absolute lift is modest, SOV gain vs competitors signals competitive positioning improved. Especially important in commodity categories." },
      { kpi: "Subsequent Performance Marketing CAC", logic: "Brand campaigns lower CAC for performance channels by warming the audience. Post-campaign CAC reduction is hidden ROI." },
    ],
  },
  {
    id: "mkt-p6", domain: "marketing",
    problem: "The CMO wants to know whether to keep, scale, or kill our influencer program. We've spent $300K with 12 creators over 9 months.",
    goldKPIs: [
      { kpi: "Direct Attributed Revenue per Creator", logic: "Trackable codes and links give the most defensible direct ROI. The first cut at 'is this campaign even close to break-even.'" },
      { kpi: "Audience Overlap with Existing Customer Base", logic: "If creator audiences heavily overlap with existing customers, attributed sales are partly cannibalization. Net new is the real metric." },
      { kpi: "Brand Search Lift in Creator's Audience Geography", logic: "Influencer impact often shows in brand awareness rather than direct conversion. Search lift in their audience geography is a less attribution-dependent signal." },
      { kpi: "Cost per Engagement (CPE) vs Comparable Channels", logic: "Even without revenue attribution, CPE benchmarks influencer cost against other awareness-driving channels (paid social, display)." },
      { kpi: "Creator Authenticity Score / Comment Sentiment", logic: "Influencer ROI depends on audience trust. Sentiment analysis on the actual posts predicts whether activations are landing or being ignored." },
    ],
  },
  {
    id: "mkt-p7", domain: "marketing",
    problem: "Average customer acquisition cost has risen 60% in 18 months. The CEO wants to know if we should pull back on growth spending.",
    goldKPIs: [
      { kpi: "LTV:CAC Ratio Trend", logic: "CAC rising is fine if LTV rose proportionally. A deteriorating ratio is the actual decision metric, not CAC alone." },
      { kpi: "CAC Payback Period", logic: "If payback period extended significantly, cash flow risk rises even if absolute LTV:CAC looks acceptable. Cash, not just unit profit, drives the decision." },
      { kpi: "CAC by Channel", logic: "If one channel's CAC drove the average up, the decision isn't 'cut growth' — it's 'cut that channel.' Channel-level isolates the answer." },
      { kpi: "Marginal CAC at Current Spend Level", logic: "Marginal CAC is what matters at decision-time, not blended. As spend scales, marginal CAC rises faster than blended — and that's the binding constraint." },
      { kpi: "Organic / Earned Acquisition Trend", logic: "If organic acquisition is still growing healthily, we can afford higher CAC on paid. If organic stalled, paid efficiency becomes the only growth lever." },
    ],
  },
  {
    id: "prod-p1", domain: "product",
    problem: "DAU dropped 15% last Tuesday with no marketing changes or known outages. Engineering says nothing shipped. How do you investigate?",
    goldKPIs: [
      { kpi: "DAU by Platform (iOS, Android, Web)", logic: "Platform segmentation isolates whether the drop is universal or platform-specific. A platform-specific drop almost always points to a technical issue (OS update, app store change, build rollout) rather than a product or market issue." },
      { kpi: "Core Action Completion Rate", logic: "If DAU fell but core action completion rate among remaining users held, users who stayed are engaging normally — the problem is acquisition or re-engagement. If completion also dropped, the product itself is broken for active users." },
      { kpi: "Notification Opt-in Rate and CTR", logic: "A sudden drop in notification delivery (carrier issue, OS permission change) can cause a DAU drop because push-driven return visits disappear." },
      { kpi: "App Version Distribution", logic: "If a new build shipped Tuesday (even internally, even to a small rollout), version distribution will show the new version and DAU can be mapped against adoption timing to confirm causation." },
      { kpi: "External Signals (App Store Reviews, Social Mentions)", logic: "A sudden DAU drop sometimes precedes an engineering team's awareness — user-reported bugs on App Store reviews or Twitter/Reddit surface the issue faster than internal monitoring." },
    ],
  },
  {
    id: "prod-p2", domain: "product",
    problem: "A new feature launched 60 days ago and adoption is at 12% against a 35% target. The PM says users don't know about it. The designer says users don't want it. Who is right, and what data resolves it?",
    goldKPIs: [
      { kpi: "Feature Discovery Rate by Entry Point", logic: "Measures what percentage of users who encounter the feature's entry point (button, tooltip, menu item) actually click into it. High discovery rate = users see it and try it = PM is wrong. Low discovery rate = users aren't finding it = PM may be right." },
      { kpi: "Feature Adoption Rate Among Users Who Discovered It", logic: "Of users who actually saw and clicked the feature, what percentage adopted it? Low adoption among discoverers = value problem = designer may be right. High adoption among discoverers = discoverability problem = PM is right." },
      { kpi: "Feature Retention Rate (D7 and D30 Within Feature)", logic: "Of the 12% who adopted, what percentage are still using the feature at D7 and D30? High feature retention = users who find it love it = discoverability problem. Low feature retention = users try it and abandon = value problem." },
      { kpi: "Qualitative Exit Survey on Feature Exit", logic: "When users exit the feature without completing the core action, do they respond to a 'what went wrong' prompt? Text analysis of responses distinguishes 'couldn't find what I needed' (discoverability) from 'this wasn't useful' (value)." },
      { kpi: "Time Spent in Feature Per Session", logic: "Users who spend < 30 seconds in a feature and leave are bouncing — a value signal. Users who spend 3+ minutes and complete an action are succeeding — a retention/habit signal." },
    ],
  },
  {
    id: "prod-p3", domain: "product",
    problem: "D7 retention dropped 8 percentage points in the cohort that signed up two weeks after a major app redesign. What do you investigate?",
    goldKPIs: [
      { kpi: "Onboarding Funnel Drop-off Rate by Step", logic: "The redesign likely changed the onboarding flow. Step-level drop-off shows which new step (or removed step) is causing users to abandon before experiencing core value." },
      { kpi: "Time to First Core Action (TTV) Pre vs Post Redesign", logic: "If the redesign made users work harder to reach the core value, TTV increased and early retention dropped. TTV is the most direct causal link between a redesign and a retention change." },
      { kpi: "App Store Reviews Sentiment (Post-Redesign)", logic: "Redesigns that confuse users generate negative reviews with specific UI complaints. Review text in the 2 weeks post-launch identifies the specific element that degraded the experience." },
      { kpi: "Core Action Completion Rate for New vs Returning Users Post-Redesign", logic: "If returning users (who know the product) are completing the core action at normal rates but new users aren't, the redesign introduced new-user-specific friction, not broad degradation." },
      { kpi: "Session Depth (Actions per Session) for New User Cohorts", logic: "Fewer actions per session in the post-redesign cohort signals users are getting stuck or confused before completing their intended task — a navigation or UX problem, not a value problem." },
    ],
  },
  {
    id: "prod-p4", domain: "product",
    problem: "Push notification opt-out rate has increased 40% over 3 months. Engineering hasn't changed notification logic. What do you investigate?",
    goldKPIs: [
      { kpi: "Notification Send Frequency Per User", logic: "If average sends per user per week increased (even from upstream logic changes like more users qualifying for triggers), higher frequency is the most common driver of opt-out spikes." },
      { kpi: "Notification CTR Trend by Notification Type", logic: "Declining CTR predicts opt-out — users who stop finding notifications valuable opt out rather than continuing to ignore them. Segmenting by type identifies which notification category users are rejecting." },
      { kpi: "Opt-out Rate by User Tenure Cohort", logic: "If opt-outs are concentrated among new users (< 30 days), the onboarding notification sequence is too aggressive. If concentrated among older users, a specific campaign or frequency change triggered fatigue in the retained base." },
      { kpi: "iOS vs Android Opt-out Rate", logic: "iOS 15+ introduced new notification management tools that made it easier to opt out. If the spike is iOS-specific, an OS update may have surfaced notification settings to users who previously didn't know how to opt out." },
      { kpi: "Revenue or DAU Impact of Lost Opt-ins", logic: "Not a diagnostic metric but a priority metric — quantifying the DAU impact of users who opted out and then churned establishes urgency for the fix and frames the business case for reducing notification volume." },
    ],
  },
  {
    id: "prod-p5", domain: "product",
    problem: "You are expanding into a new international market. What metrics would you track in the first 90 days to know if the expansion is working?",
    goldKPIs: [
      { kpi: "User Activation Rate (Market-Specific)", logic: "The first question in any new market is whether the product's core value translates. Activation rate tells you if new market users are reaching the 'aha moment' at comparable rates to your home market." },
      { kpi: "D7 and D30 Retention by Acquisition Cohort", logic: "Retention curves in the new market tell you whether initial activation translates to habit formation. Low D7 retention despite high activation means the product solves a problem users have once but not repeatedly — a market-fit signal." },
      { kpi: "Core Action Completion Rate", logic: "Even if users sign up and activate, the specific core action completion rate reveals whether the product's primary value is culturally or contextually appropriate in the new market." },
      { kpi: "Support Ticket Rate and Topic Distribution", logic: "New market support tickets reveal localization gaps — missing language, payment method issues, or cultural features that don't work — before they become churn drivers." },
      { kpi: "CAC vs LTV (Market-Specific, 90-Day)", logic: "The expansion is only viable if the unit economics hold in the new market. CAC varies by market; LTV depends on local retention and monetization. Comparing market-specific LTV:CAC by day 90 determines whether to scale or reassess." },
    ],
  },
  {
    id: "prod-p6", domain: "product",
    problem: "DAU is growing but DAU/MAU stickiness ratio is declining. What does this mean and what do you investigate?",
    goldKPIs: [
      { kpi: "New User Acquisition Volume vs Existing User DAU", logic: "If new users are flooding in (inflating MAU) but converting to daily users at a lower rate than prior cohorts, MAU grows faster than DAU. Decomposing DAU into 'new vs existing users' tells you whether growth is diluting stickiness." },
      { kpi: "Stickiness by User Tenure Cohort", logic: "Calculate DAU/MAU separately for users by tenure (0-30 days, 31-90 days, 90+ days). If long-tenured user stickiness is stable but new user stickiness is low, the retention flywheel is intact but onboarding isn't building habits fast enough." },
      { kpi: "Core Action Completion Rate Trend", logic: "Stickiness declines when users open the app less frequently. Core action completion rate declining suggests users are finding less value per session — the product's core use case may be weakening." },
      { kpi: "Session Frequency Distribution (Power vs Casual)", logic: "If the user base is bifurcating — a core of daily users and a growing tail of weekly or monthly users — aggregate stickiness will decline even if the core is healthy. Understanding the distribution matters more than the average." },
      { kpi: "Notification Opt-in Rate and CTR", logic: "Push notifications are a primary driver of return visits. If opt-in rate is declining or CTR is falling, fewer users are being successfully reminded to return — a notification program problem that manifests as a stickiness problem." },
    ],
  },
  {
    id: "prod-p7", domain: "product",
    problem: "The top 10% of users generate 65% of all core actions. Leadership is concerned the product is too dependent on power users. Is this a problem?",
    goldKPIs: [
      { kpi: "Power User Churn Rate vs. Casual User Churn Rate", logic: "If power users churn at low rates (< 5% monthly) and casual users churn at high rates (> 30% monthly), the concentration is a structural feature of the user base, not a fragility risk. The business is actually more stable than it looks." },
      { kpi: "Power User LTV vs. Casual User LTV", logic: "The business question isn't engagement concentration but revenue concentration. If power users monetize at 10× casual users, losing them would be catastrophic. If monetization is flat per user, the concentration is analytically interesting but financially less concerning." },
      { kpi: "Power User Growth Rate", logic: "If the power user cohort is growing steadily, the product is successfully converting casual users into power users over time. If the power user count is flat or declining, the concentration is increasing because casual users are churning — a different and more serious problem." },
      { kpi: "Feature Adoption Rate Among Casual Users", logic: "Casual users who adopt more features typically move up the engagement curve. Feature adoption rate for the bottom 50% of users identifies which product investments would broaden the engaged base." },
      { kpi: "Cohort Retention Curve Shape for New Users", logic: "If new user cohorts show a flattening retention curve (even at a low absolute level), the product is successfully creating habituated users over time. The power user concentration may just be the natural outcome of a long retention cycle." },
    ],
  },
  {
    id: "prod-p8", domain: "product",
    problem: "K-factor has dropped from 0.8 to 0.3 over the past two quarters. The virality engine is breaking. Where do you look?",
    goldKPIs: [
      { kpi: "Invitation Send Rate (Invites Per Active User)", logic: "K-factor = invite rate × conversion rate. If invite rate dropped, users are sending fewer invitations. This happens when the referral incentive changes, the share UI is harder to find, or the product moment that triggers sharing has weakened." },
      { kpi: "Invitation Conversion Rate (Invites to Signups)", logic: "If invite rate held but conversion rate dropped, the invitations are landing but not convincing people to sign up. This is a landing page, onboarding, or product value proposition problem — invited users aren't seeing enough value to sign up." },
      { kpi: "Viral Loop Touchpoints (Where Users Share)", logic: "Map every point in the product where users can share or invite. If a UI redesign moved the share button, changed the copy, or removed a natural sharing moment, invite rates will drop without any intentional change to the referral program." },
      { kpi: "Referral Quality (D30 Retention of Referred vs Organic Users)", logic: "Even if K-factor recovers, poor referral quality (low-retention invited users) means the viral loop is importing the wrong users. Quality of referred users is as important as quantity." },
      { kpi: "Incentive ROI (Cost per Referred User vs LTV of Referred User)", logic: "If the referral incentive changed in cost or type, the economics may have shifted. Mapping incentive spend against referred user LTV determines whether the viral loop is still worth investing in at all." },
    ],
  },
];

// ── INTEL MODE WRAPPER (replaces direct KPILibraryMode call) ───────────────
// NOTE: KPI_DOMAINS is already defined earlier from Mode 1 insert; do not redeclare.

const INTEL_SUBMODES = [
  { id: "library",   label: "📖 KPI Library",      description: "Reference cards" },
  { id: "dashboard", label: "📊 Dashboard Drill", description: "60-sec timed reading" },
  { id: "problem",   label: "🧩 Problem to Metric", description: "Diagnostic reasoning" },
  { id: "insight",   label: "💡 Insight & Rec",    description: "Recommendation framing" },
  { id: "abtest",    label: "🧪 A/B Test",          description: "Experiment analysis" },
];

// ── MODE 4: INSIGHT & RECOMMENDATION ───────────────────────────────────────
// 32 scenarios across 5 domains. Hybrid format:
// 1. Structured fields: insight, recommendation, measurement plan
// 2. Free-text VP pitch synthesizing the structured analysis into one paragraph
// AI grading targets four common junior failure modes:
//   - Stopping at description instead of prescription
//   - Recommendations that aren't actionable
//   - Missing the tradeoff or cost
//   - No measurement plan

const INSIGHT_SCENARIOS = [
  // RETAIL / E-COMMERCE — 7 scenarios
  
  {
    id: "retail-i1", domain: "retail",
    finding: "Customers who use the mobile app convert at 2.3× the rate of web-only customers and have 38% higher 90-day LTV. However, only 18% of new signups install the app, and the install rate has been flat for 9 months despite multiple banner campaigns prompting downloads.",
    context: "DTC apparel brand. App install costs $3.20 via paid social. Average new customer LTV is $142.",
    goldStandard: {
      insight: "App-using customers are structurally more valuable, but the conversion path from signup to install is broken. The flat install rate despite multiple banner campaigns indicates the prompts themselves are being ignored — this is a friction problem, not an awareness problem.",
      recommendation: "Move the install prompt from a passive banner to a contextual moment with a real benefit attached: trigger it post-first-purchase with a 'Track your order in the app + 15% off your next order' CTA. Targets the moment customers are most engaged and ties install to immediate utility.",
      measurement: "Primary: install conversion rate from prompt impression (target 8-12% vs current ~2%). Secondary: 30-day retention of post-purchase installers vs control. Time horizon: 60 days. Cut criterion: if install rate doesn't double in 30 days, the friction is deeper than the prompt.",
      pitchAnchor: "We're missing 80% of our highest-LTV customer pathway because the install prompt is invisible. Moving it to post-purchase with a 15% reorder offer should triple install rate within 60 days; if it doesn't, we've ruled out the prompt and need to look at the install flow itself. Cost is one developer week and ~$4 per acquired install vs paid social's $3.20 — but the LTV uplift makes the ROI 3-4x stronger.",
    },
  },
  {
    id: "retail-i2", domain: "retail",
    finding: "Cart abandonment rate has held steady at 71% for two years, in line with industry average. However, 34% of abandoners come back within 7 days and complete purchase without a recovery email. The remaining 66% never return.",
    context: "Mid-market e-commerce, $80M GMV. Recovery email program has been running for 5 years and shows a 12% recapture rate.",
    goldStandard: {
      insight: "The 'cart abandonment problem' isn't one problem — it's two. Half the population is browsing-as-shopping behavior that resolves naturally; the other half is genuinely lost. The recovery email is being credited with recapturing customers who would have come back anyway, inflating the program's apparent ROI.",
      recommendation: "Suppress recovery emails for the first 24 hours after abandonment. The 34% who return naturally don't need the email; sending it cannibalizes attribution and trains them to expect a discount. After 24 hours, send aggressive recovery to the remaining 66% with a different offer (free shipping vs discount) tested by segment.",
      measurement: "Primary: total purchase recovery rate at the cohort level (24-hr suppressed vs control). Secondary: discount-burden percentage of recovered orders. Time horizon: 6 weeks. Cut criterion: if total recovery rate drops more than 1pp, restore baseline cadence.",
      pitchAnchor: "Our recovery email program is taking credit for customers who would have come back anyway. Suppressing the first 24 hours of recovery emails will let us see the program's true incrementality and reduce discount burden on naturally-returning customers. Expected outcome: same total recovery, lower margin cost. If recovery drops, we restore — risk-bounded test, no downside.",
    },
  },
  {
    id: "retail-i3", domain: "retail",
    finding: "Email subscribers acquired through the homepage 'sign up for 10% off' modal have 41% lower 90-day LTV than subscribers acquired through content downloads (style guides, gift guides). Modal acquisition is 4× cheaper per subscriber.",
    context: "Apparel DTC, email is 38% of revenue. Modal acquires ~12,000 subscribers per month at $0.40 each; content acquires ~3,000 per month at $1.60 each.",
    goldStandard: {
      insight: "We're optimizing email list growth on the wrong metric. The modal cost per subscriber looks better but masks LTV-adjusted CAC; on a true unit economics basis, content subscribers are cheaper per dollar of revenue generated. Scaling the modal is making the list bigger and less valuable.",
      recommendation: "Cap modal acquisition at current volume; reinvest the savings into expanding content marketing. Specifically, fund 2 new gift/style guides per quarter and promote them via paid social to lookalikes of existing high-LTV subscribers. Test paid distribution of one existing top-performing guide first to validate scale economics.",
      measurement: "Primary: 90-day LTV per email subscriber acquired in the new mix. Secondary: total email channel revenue (must hold or grow). Cohort comparison at 90 and 180 days. Cut criterion: if total email revenue drops 5%+ over 90 days, modal cap is wrong; restore.",
      pitchAnchor: "Our cheap email subscribers are also our least valuable. Reallocating modal budget into expanded content marketing should improve LTV per subscriber by ~30% even at higher CAC, because content subscribers stay engaged longer. Total revenue should hold; if it drops, we revert. The hidden tradeoff is shorter-term list growth — content acquires fewer subs at higher value, so list size will grow slower for 60-90 days.",
    },
  },
  {
    id: "retail-i4", domain: "retail",
    finding: "First-time buyers who use a discount code have a 19% repeat purchase rate within 90 days. First-time buyers who pay full price have a 34% repeat purchase rate. The gap has widened from 8 percentage points two years ago to 15 today.",
    context: "DTC home goods brand. Welcome offer (15% off first order) drives 62% of first-time purchases. Margin per order is 47% pre-discount, 38% post-discount.",
    goldStandard: {
      insight: "The welcome offer is acquiring two different customer types under the same promo: brand-loyal customers who would have bought anyway (margin loss with no behavior change) and price-sensitive customers who repurchase poorly (acquisition without retention). The widening retention gap suggests we're attracting more of the second type over time.",
      recommendation: "Replace the universal 15% welcome offer with a tiered approach: offer free shipping (lower margin cost) by default, and reserve the 15% for retargeting visitors who left without buying. This reduces discount on customers who would have bought without it, while preserving the conversion lift for genuinely price-sensitive prospects.",
      measurement: "Primary: 90-day LTV by acquisition offer cohort, controlled for first-order traffic source. Secondary: first-purchase conversion rate (must not drop more than 2pp). Time horizon: 90 days for full LTV signal. Cut criterion: if first-purchase conversion drops 3pp+ in first 30 days, walk back.",
      pitchAnchor: "Our 15% welcome offer is teaching customers to expect a discount and acquiring our worst repeat-purchasers. Switching to free shipping as the default offer keeps conversion high while reserving the discount for genuinely price-sensitive segments. Expected: 90-day LTV up 8-12% per first-time buyer. Risk: short-term first-purchase conversion may drop if free shipping doesn't carry the same urgency; we'll know within 30 days.",
    },
  },
  {
    id: "retail-i5", domain: "retail",
    finding: "Returns on the women's denim category have risen from 19% to 31% over 18 months. Customer reviews show no decline in satisfaction scores (still 4.3/5), and quality complaints are flat. The increase is concentrated in two of seven SKUs that share a new fabric vendor introduced 14 months ago.",
    context: "Mid-market denim brand. Average return cost is $14 per unit (reverse logistics + restocking + ~22% markdown on return-to-stock). Affected SKUs represent ~$8M annual revenue.",
    goldStandard: {
      insight: "Returns are a fit problem, not a quality problem — 4.3/5 review scores and flat complaints rule out manufacturing defects. The new fabric vendor likely changed stretch or stiffness in ways customers don't articulate but vote on with returns. The two affected SKUs are the canary; expect spread to other SKUs as the vendor's fabric ages further into the line.",
      recommendation: "Pull a sample of returned items from both vendor cohorts (old and new fabric) and run dimensional + stretch testing against original specifications. If specs drift confirmed, request vendor remediation or switch back. If specs are within tolerance, the issue is sizing communication on the product page (size chart, fit description) — different fix.",
      measurement: "Primary: return rate by SKU and vendor cohort, weekly. Secondary: total denim category margin (return cost is 4-5% of category revenue today). Action threshold: vendor switch if specs drift, sizing chart update if specs hold. Time horizon: 14 days for testing, 60 days for return rate response.",
      pitchAnchor: "We're losing $1.1M annually to denim returns and the cause is fabric drift, not quality complaints. Lab testing two return cohorts costs us $3K and 14 days. If specs drifted, we have leverage to demand vendor remediation; if they didn't, we update sizing communication. Either way, we stop the spread before it hits the rest of the denim line.",
    },
  },
  {
    id: "retail-i6", domain: "retail",
    finding: "The loyalty program has 340,000 active members. Top-tier members (>$1,000 annual spend) are 4.2% of the program but generate 31% of revenue. However, top-tier promotion-from-mid-tier rate has dropped from 14% to 6% over the past year.",
    context: "Specialty retail. Loyalty program is 6 years old. Top tier earns 5% back; mid tier earns 2%. Promotion from mid to top requires $1,000+ annual spend.",
    goldStandard: {
      insight: "The program's most valuable customers are still valuable, but the pipeline feeding them is collapsing. A drop in promotion rate from 14% to 6% over 12 months means the funnel that converts mid-tier members into top-tier ones is breaking — and since top tier is 31% of revenue, this is a leading indicator of revenue concentration risk and eventual revenue decline as the existing top tier ages out.",
      recommendation: "Re-examine what differentiated mid-tier members who promoted vs those who didn't last year. Likely candidates: category breadth (multi-category buyers promote at higher rates), engagement frequency (active email opens correlate with annual spend), or specific high-AOV product purchases. Build a targeted promotion campaign for high-promotion-probability mid-tier members in the next quarter to test which lever drives promotion.",
      measurement: "Primary: promotion rate from mid to top tier among targeted vs control cohort, 90-day window. Secondary: incremental revenue per promoted member. Cut criterion: if targeted promotion campaign doesn't lift the promotion rate by at least 2pp, the lever is wrong; investigate at the cohort level instead.",
      pitchAnchor: "Our top tier still works, but the pipeline feeding it is closing. If we don't fix the promotion rate, we lose 30% of revenue concentration over 24-36 months as today's top tier churns naturally. The diagnostic costs us one analyst week and a targeted campaign budget; the upside is preserving our most defensible revenue segment. Timeline: 90 days to know whether the lever is reachable or whether we need a deeper structural fix.",
    },
  },
  {
    id: "retail-i7", domain: "retail",
    finding: "Site search queries have grown 28% YoY but search-to-purchase conversion has dropped from 8.1% to 5.4%. The top 50 queries account for 62% of search volume, but conversion on those specific queries is only 4.1% — significantly below the average.",
    context: "Mid-market home goods e-commerce. Site search is responsible for ~22% of all transactions. Search infrastructure is a third-party SaaS tool.",
    goldStandard: {
      insight: "The site search problem is concentrated, not diffuse. The fact that the top 50 queries (a focused, addressable list) underperform the search average means the issue is matching specific high-intent queries to inventory, not general algorithm performance. This is a content-and-merchandising problem, not a search-tech replacement problem.",
      recommendation: "Audit the top 50 queries individually: what results do they return today, what's the conversion gap, and what would a senior merchandiser put on the first page? Then create curated landing pages for the top 25 queries (those alone are ~31% of total search volume). This is a 2-week merchandising sprint, not a platform migration.",
      measurement: "Primary: conversion rate on top 50 queries (target: lift from 4.1% to baseline 5.4% or above). Secondary: total search-driven revenue. Cut criterion: if curated landing pages don't lift conversion by 1pp+ within 30 days, the issue is deeper (relevance algorithm, not merchandising) and warrants vendor evaluation.",
      pitchAnchor: "Our site search problem is the top 50 queries — a focused list we can audit and fix in a two-week sprint. We don't need a platform migration; we need merchandising attention on what customers are actually searching for. Lifting these queries to baseline conversion recovers ~$2M in annual revenue. If the fix doesn't work, we've ruled out merchandising and have a clean case for the platform conversation.",
    },
  },

  // HEALTHCARE — 7 scenarios
  {
    id: "hc-i1", domain: "healthcare",
    finding: "30-day readmission rate for CHF (heart failure) patients is 22%, well above the 18% national benchmark and triggering CMS penalty risk. However, patients who receive a documented post-discharge phone call within 48 hours have a readmit rate of 11%; those who don't have a 28% rate. Only 47% of CHF discharges currently get the call.",
    context: "Community hospital, ~280 beds. CHF is the highest-volume readmit-targeted DRG. Each readmit costs ~$11K in unreimbursed care plus reputation/penalty risk.",
    goldStandard: {
      insight: "We have an evidence-based intervention with a 17pp readmit reduction (from 28% to 11%), but we're delivering it to fewer than half of eligible patients. The aggregate readmit rate is being dragged up by the unreached half. This isn't a clinical problem — it's a process compliance problem.",
      recommendation: "Add the 48-hour post-discharge call to the standard CHF discharge order set as a required workflow with explicit ownership (care management RN), tracked daily on the unit dashboard. Audit 4 weeks of pilot data before scaling to other readmit-targeted DRGs (COPD, pneumonia).",
      measurement: "Primary: 48-hour call completion rate (target 90%+ within 60 days), readmit rate at 30 days. Secondary: care management RN workload (must remain feasible). Cut criterion: if call rate doesn't reach 80% within 8 weeks, the workflow has structural barriers we haven't addressed.",
      pitchAnchor: "We have the intervention and the evidence — what we don't have is reliable execution. Building the 48-hour CHF call into the discharge workflow with explicit ownership should lift completion from 47% to 90%+ within 60 days. Expected aggregate readmit reduction: 4-6pp, moving us back below the CMS penalty threshold. The cost is one care management FTE realignment, not new headcount; the saved penalty exposure alone justifies the investment.",
    },
  },
  {
    id: "hc-i2", domain: "healthcare",
    finding: "Days in AR has risen from 38 to 52 days over six months. Initial denial rate has held steady at 8%. The change is driven entirely by one commercial payer — their average days-to-pay has stretched from 28 days to 67 days.",
    context: "Multi-specialty physician group, ~$45M annual revenue. The affected payer represents 22% of total revenue. Contract renewal is in 8 months.",
    goldStandard: {
      insight: "The AR problem looks like a billing problem on the dashboard but is actually a payer problem. One payer's slow-pay behavior is dragging the average; everyone else is performing normally. This is leverage we're losing in the upcoming contract negotiation if we don't document and address it now.",
      recommendation: "Document the days-to-pay trend in writing to the payer's provider relations team with specific claim examples. In parallel, model the cash flow impact of the slow-pay on operations and prepare contract amendment language requiring a specific payment timeliness standard (e.g., 30-day clean claim payment). Use this as a non-rate concession in the contract negotiation.",
      measurement: "Primary: days-to-pay for the affected payer, weekly. Secondary: cash flow impact (carrying cost of extended AR). Decision threshold: if no movement in 60 days, escalate to contract amendment formally. Final outcome: contract renewal includes payment-timeliness language.",
      pitchAnchor: "Our days-in-AR problem is one payer slow-walking us, not a billing failure. Documenting their behavior now gives us a non-rate concession to demand at contract renewal — payment timeliness in writing. Cash flow impact today is roughly $1.2M tied up; resolved at renewal, we recover that and prevent recurrence. The risk is the payer pushing back, but they have weaker leverage when their slow-pay is documented.",
    },
  },
  {
    id: "hc-i3", domain: "healthcare",
    finding: "The hospital's medication adherence rate (Proportion of Days Covered) for diabetic patients is 64%, below the 80% PDC threshold for Star Rating credit. Patients in our embedded pharmacy program (filling Rx on-site) have an adherence rate of 81%; patients filling externally have a rate of 58%.",
    context: "Health system with ~24,000 attributed Medicare Advantage members. Embedded pharmacy program covers 28% of diabetic patients today. Each Star Rating point is worth ~$2.4M in bonus payments.",
    goldStandard: {
      insight: "The pharmacy embedding program works — 23pp lift in adherence — but it covers only 28% of the eligible population. The aggregate metric is being dragged below threshold by the 72% of diabetic patients who fill externally. This is a scale problem with a known-good solution, not an unknown clinical challenge.",
      recommendation: "Expand embedded pharmacy enrollment to cover 60%+ of diabetic patients within 12 months. Target the highest-risk patients first (recent ED visits, A1C >9.0, multiple comorbidities) using risk stratification. Build proactive enrollment outreach into care management workflow rather than relying on patient opt-in at appointment.",
      measurement: "Primary: PDC for diabetic patients at the population level. Secondary: enrollment rate in embedded pharmacy program. Time horizon: 12 months for full Star Rating impact. Cut criterion: if 6-month enrollment expansion doesn't lift aggregate PDC by 6pp+, the patient mix entering the program isn't the right one.",
      pitchAnchor: "We have a 23pp adherence lever proven on 28% of our diabetic patients. Scaling that to 60% within 12 months should move the population PDC from 64% to 75%+, putting the Star Rating point in reach. Each rating point is worth $2.4M in bonuses; the program expansion costs roughly $400K in care management capacity. Even at half the projected lift, the ROI is 3:1.",
    },
  },
  {
    id: "hc-i4", domain: "healthcare",
    finding: "The outpatient clinic's no-show rate is 19%, costing approximately $850K in unrealized revenue annually. New-patient appointments have a 28% no-show rate; established patient follow-ups have a 14% rate. Most no-shows happen on Mondays for appointments booked more than 14 days in advance.",
    context: "Multi-specialty clinic, 8 providers. Current intervention is a 24-hour reminder text; opt-in rate is 71%.",
    goldStandard: {
      insight: "The no-show problem is concentrated and predictable: new patients booked more than two weeks ahead, especially for Monday slots. The 24-hour reminder isn't enough for high-risk appointments because by 24 hours out, the cognitive distance from when the patient committed has already faded.",
      recommendation: "Add a 7-day reminder for new-patient appointments and Monday slots specifically, with an explicit confirm/reschedule call-to-action. Implement a 24-hour cancellation grace window so patients can reschedule without friction (reducing no-shows that happen because rescheduling feels harder than skipping). Hold one new-patient slot per provider per day as a same-day-fill release at 8 AM.",
      measurement: "Primary: no-show rate by appointment type and lead time. Secondary: same-day fill rate on released slots. Cut criterion: if 7-day reminder doesn't reduce new-patient no-shows by 4pp+ within 60 days, the issue is access not memory; investigate alternative.",
      pitchAnchor: "We're losing $850K annually to no-shows, concentrated in a predictable segment we can target with a tiered reminder strategy. A 7-day reminder for new patients plus same-day slot release should recover 25-40% of the lost revenue within 90 days. Cost is minimal — workflow change in our scheduling tool, plus front-desk capacity for same-day fill. Risk: the no-show population has structural barriers (transportation, work schedules) that no reminder will fix; the ceiling on improvement is probably 50%.",
    },
  },
  {
    id: "hc-i5", domain: "healthcare",
    finding: "Surgical site infection rate after total joint replacement has risen from 1.4% to 2.6% over two years, despite stable case mix and provider team. Pre-operative bathing protocol compliance has dropped from 94% to 71% in the same period.",
    context: "Hospital orthopedic service line, ~600 TJR cases annually. Each SSI costs approximately $52K in extended length of stay, antibiotic course, and potential revision surgery. Currently exceeds NHSN benchmark.",
    goldStandard: {
      insight: "We have a clear correlation between a known-effective intervention (pre-op chlorhexidine bathing) and the rising infection rate. Compliance dropped 23pp; infection rate roughly doubled. The clinical evidence supports causation. This isn't a sterile-technique mystery — it's a documentation and workflow problem at the pre-op step.",
      recommendation: "Make pre-op bathing a hard-stop checklist item before OR booking is finalized, with electronic verification (patient signs the bathing instruction acknowledgment, OR scheduling can't proceed until check completes). Audit 30 days of compliance, then expand to other SSI-targeted procedures (cardiac, colorectal).",
      measurement: "Primary: bathing protocol compliance (target 95%+), SSI rate trended monthly. Secondary: OR scheduling delays caused by hard-stop. Cut criterion: if compliance restores to 95%+ but SSI rate doesn't return to 1.4-1.6% within 6 months, there's a different infection vector and we need to broaden the investigation.",
      pitchAnchor: "We're paying $1.5M annually in additional SSI cost because we stopped enforcing a 5-cent intervention. Restoring pre-op bathing compliance via hard-stop scheduling integration is a 30-day operational fix, not a clinical redesign. Expected outcome: SSI rate returns to baseline within 6 months, recovering most of the $1.5M. The risk is that restored compliance doesn't fully recover the rate, in which case we have a different problem to investigate — but we'll have ruled out the highest-probability cause.",
    },
  },
  {
    id: "hc-i6", domain: "healthcare",
    finding: "ED throughput analysis shows that 72% of patients are discharged within 4 hours, but the remaining 28% spend an average of 9.2 hours in the department. This boarding population is driving 84% of LWBS (left-without-being-seen) cases and 91% of patient complaints.",
    context: "Community hospital ED, 38,000 annual visits. Inpatient bed occupancy averages 88%. The 28% are mostly admitted patients waiting for a floor bed.",
    goldStandard: {
      insight: "The ED has two distinct populations and one of them is quietly destroying the experience metrics. The 9.2-hour boarders aren't an ED problem — they're a hospital throughput problem manifesting in the ED. Fixing the average ED length of stay won't help; only inpatient discharge velocity will.",
      recommendation: "Stop optimizing the ED and start optimizing inpatient discharge timing. Specifically: pull discharge orders from afternoon to morning rounds (target 11 AM discharge, not 4 PM), and create a discharge holding area so the room can turn over for a boarder before the patient physically leaves the building. The bottleneck is 4-6 hours of bed-availability daily, not ED capacity.",
      measurement: "Primary: median time from discharge order to bed availability for next patient. Secondary: ED boarding hours, LWBS rate. Time horizon: 90 days. Cut criterion: if morning discharge initiative doesn't reduce ED boarding by 25%+ within 90 days, the bottleneck isn't bed availability — it's volume vs capacity, which requires a longer-horizon intervention.",
      pitchAnchor: "Our ED problem isn't an ED problem — it's an inpatient discharge problem showing up in the wrong department. Shifting discharge timing from afternoon to morning rounds plus creating a discharge holding area can free up 4-6 hours of bed availability daily, which would cut ED boarding hours by ~30% within 90 days. The cost is workflow change across hospital medicine; the savings are reduced LWBS revenue loss (~$400K annually) and the patient experience improvement that goes with it.",
    },
  },
  {
    id: "hc-i7", domain: "healthcare",
    finding: "OR utilization is 62%, well below the 80% target. Block utilization data shows that 4 of 14 surgeons account for 73% of unused block time, while the other 10 surgeons fully utilize their blocks and frequently need add-on cases.",
    context: "Hospital surgical service line, 14 active surgeons, $42M annual surgical revenue. Each empty OR hour costs ~$2,800 in fixed cost without revenue.",
    goldStandard: {
      insight: "OR utilization isn't broken at the system level — it's broken at the block-allocation level. We're holding OR capacity for surgeons who don't fill it while denying capacity to surgeons who would. This is allocation inefficiency masquerading as a utilization problem.",
      recommendation: "Implement a 24-hour automatic block release rule: if a block isn't filled to 80% by 24 hours before, it's released to a network-wide queue. Reallocate underutilized blocks from the 4 low-utilization surgeons to the 10 high-utilization surgeons over the next quarter using utilization data as the allocation criterion.",
      measurement: "Primary: aggregate OR utilization (target 78%+ within 6 months). Secondary: surgeon-level utilization variance (should compress). Tertiary: cancellation rate (must remain stable; reallocation can sometimes spike late cancels). Cut criterion: if aggregate utilization doesn't lift 8pp within 6 months, allocation isn't the constraint; investigate first-case start times and turnover.",
      pitchAnchor: "We have $4.5M of unused OR capacity locked up in blocks held for surgeons who don't fill them, while our high-volume surgeons absorb add-on cases inefficiently. A 24-hour automatic block release rule plus quarterly reallocation based on utilization data should lift aggregate utilization 8-12pp within 6 months. The political cost is real — surgeons fight for their blocks — but we have data, not opinion, as the allocation criterion. Lost revenue is the bigger risk than the political pushback.",
    },
  },

  // FINANCE — 6 scenarios
  {
    id: "fin-i1", domain: "finance",
    finding: "Net Revenue Retention has dropped from 118% to 104% over the past year. Decomposed, Gross Revenue Retention is stable at 91% but expansion revenue per account has fallen 38%. Customer success team headcount has been flat, but their account load has grown 24%.",
    context: "B2B SaaS, $48M ARR. Average annual contract value is $42K. Expansion is primarily seat-based and usage-based growth in existing accounts.",
    goldStandard: {
      insight: "The retention numbers are deceiving. GRR is fine — we're not losing customers faster. What's broken is expansion: existing customers stopped growing in our product. CS reps are stretched 24% thinner without headcount, which means the 'expansion conversation' that used to happen in QBRs isn't happening, and seat growth that used to be facilitated has gone unattended.",
      recommendation: "Add 4 CS hires (matching the 24% account-load growth) and explicitly redefine the CS role to include quarterly expansion planning conversations as a metric. This isn't 'more hands' — it's reclaiming the strategic conversations CS used to drive that have lapsed under load.",
      measurement: "Primary: expansion revenue per account, monthly cohort. Secondary: NRR. Cut criterion: if expansion ARR per account doesn't lift 15%+ within 6 months of the hires, the issue isn't bandwidth; the product expansion path itself has weakened.",
      pitchAnchor: "Our retention numbers hide that we stopped expanding. Customer success has 24% more accounts with the same headcount, and the expansion conversations that used to drive seat growth have lapsed. Adding 4 CS hires costs ~$600K and should restore expansion ARR by $4-6M within 6 months — a 7-10x ROI. If it doesn't, the expansion path itself has broken and we have a product problem to confront, but bandwidth is the highest-probability cause and the cheapest fix.",
    },
  },
  {
    id: "fin-i2", domain: "finance",
    finding: "Days Sales Outstanding has expanded from 41 to 58 days over 18 months. The expansion is concentrated in our top 5 customers, who together represent 38% of revenue. Their average DSO has grown from 35 to 79 days. None have triggered formal collection escalation.",
    context: "B2B services firm, $32M annual revenue. Working capital line is at 70% utilization. Top 5 customers are strategic relationships with multi-year history.",
    goldStandard: {
      insight: "Our biggest customers are using us as a credit line, and we let them because they're 'strategic.' The DSO expansion isn't a collection failure — it's an unenforced policy with our most leveraged customer relationships. The strategic value is real, but so is the working capital cost, and we're absorbing it without acknowledgment.",
      recommendation: "Quantify the working capital cost (tied-up cash × cost of capital) and present it to each top-5 customer as an invoice for early-payment-discount or late-payment-fee. Frame this as a policy normalization, not a punitive measure. Pair with offering 1.5%/10 net 30 early payment discount to give them an upgrade path.",
      measurement: "Primary: weighted-average DSO for top 5 customers. Secondary: days from invoice to collection by customer, monthly. Cut criterion: if no movement after 90 days, escalate to contract review or factor selectively.",
      pitchAnchor: "We're carrying $1.8M of working capital cost so our top customers don't have to. Quantifying that cost and presenting it to them — alongside an early-pay discount option — normalizes the relationship without breaking it. Even partial movement (DSO from 79 to 50 days) would free up $1.1M and reduce credit line draws. The risk is relationship friction with strategic accounts, but we're already paying the price; making it visible is the first step to negotiating it.",
    },
  },
  {
    id: "fin-i3", domain: "finance",
    finding: "Operating margin has compressed from 18% to 11% over two years, while revenue has grown 42%. The compression is driven primarily by SG&A growing 67% in the same period — specifically, headcount growth across non-revenue-generating functions (HR, Finance, IT) has outpaced revenue growth by 20pp.",
    context: "Mid-market technology company, $180M revenue. Recent IPO has created scrutiny on operating leverage. Stock has traded down 28% on margin compression.",
    goldStandard: {
      insight: "We're hiring like a startup but pretending to be a public company. The 67% SG&A growth means we built infrastructure ahead of revenue scale — appropriate when capital is cheap and growth is the only metric, but punishing now that the market is pricing operating leverage. Each function has plausible justifications individually, but the aggregate signals organizational drift, not strategic investment.",
      recommendation: "Implement a hiring freeze on non-revenue functions for two quarters and require a CFO sign-off on any backfill. In parallel, identify three SG&A functions that are over-resourced relative to peer companies of our size (likely candidates: HR ratio, Finance team size, IT support breadth) and reduce headcount by attrition rather than RIF.",
      measurement: "Primary: operating margin trajectory by quarter. Secondary: SG&A % of revenue (target return to 28-30% from current 36%). Cut criterion: if margin doesn't recover to 14%+ within 4 quarters, the cost structure has structural commitments (multi-year leases, tooling contracts) that need separate intervention.",
      pitchAnchor: "We over-built infrastructure on the way up and the market is punishing us for it. A two-quarter hiring freeze on non-revenue functions plus targeted attrition in over-resourced areas should restore margin to 14% by year-end — short of the 18% historical, but enough to break the compression narrative. The cost is friction with function leaders who built their teams in good faith, but the alternative is accepting the lower multiple permanently.",
    },
  },
  {
    id: "fin-i4", domain: "finance",
    finding: "Free cash flow has dropped 31% YoY despite 8% revenue growth and stable EBITDA margins. Working capital absorbed $42M, primarily inventory ($28M) and accounts receivable ($14M).",
    context: "Manufacturing company, $480M revenue. Inventory build was a deliberate response to supply chain volatility 18 months ago. Most concerning: inventory has stayed elevated even as supply chain normalized.",
    goldStandard: {
      insight: "The inventory build was a rational response to supply chain shocks — but it's become structural. We added safety stock when we needed it; we never removed it when conditions normalized. That's $28M of trapped cash earning the company nothing while costing the company storage, obsolescence risk, and working capital interest.",
      recommendation: "Recalibrate safety stock levels based on current (not 2023) supply chain variability. Categorize inventory by demand stability and lead-time risk; reduce safety stock 30-40% on stable, short-lead-time SKUs. Pair with selling-down aged inventory through end-of-life promotions to free cash before fiscal year-end.",
      measurement: "Primary: inventory days on hand by SKU velocity tier. Secondary: free cash flow conversion ratio (target return to 85%+ from current 60%). Cut criterion: if inventory reduction triggers stockouts that exceed 1% of revenue, the recalibration was too aggressive; restore selectively.",
      pitchAnchor: "We built a $28M inventory buffer for supply chain shocks that are no longer happening, and we've kept it. Recalibrating safety stock to current variability levels can release $15-18M of trapped cash within 6 months without meaningful stockout risk. The CFO conversation here is straightforward — this is balance sheet hygiene, not operational risk-taking. The bigger conversation is making sure our planning systems automatically recalibrate as conditions change, so this doesn't recur.",
    },
  },
  {
    id: "fin-i5", domain: "finance",
    finding: "EBITDA grew 15% YoY but stock-based compensation rose 38% in the same period. Adjusted (ex-SBC) operating margin is up 1.2pp; GAAP operating margin is down 2.4pp. Investor commentary increasingly focuses on the gap.",
    context: "Public technology company, $620M revenue. Equity comp policy was set 3 years ago in a different rate environment. Compensation expense reform has been raised by two activist investors.",
    goldStandard: {
      insight: "The accounting story (adjusted EBITDA grew nicely) hides an economic story (we're paying more for the same outcomes via stock dilution). When SBC was 'cheap' in a high-multiple environment, the dilution was tolerable. In today's lower-multiple environment, the dilution costs shareholders real value, and the activist commentary reflects that reality.",
      recommendation: "Conduct a comprehensive review of the equity comp framework, comparing dilution rates and grant philosophies to comparable peer companies. Specifically examine whether refresh grant cadence (every 2-3 years) and grant sizing have drifted upward as the stock declined — a common mechanic that creates compounding dilution. Bring updated framework to the Compensation Committee within one quarter.",
      measurement: "Primary: SBC as % of revenue (target reduction toward peer median over 4-6 quarters). Secondary: dilution rate per share (target return to 2-3% annual from current 5-6%). Cut criterion: if peer benchmarking reveals our framework is in line with peers, the issue is rate environment; communicate that more clearly to investors rather than restructuring.",
      pitchAnchor: "Our adjusted EBITDA story is good, but our GAAP story is getting harder to defend with shareholders watching SBC closely. A comprehensive equity comp review with peer benchmarking lets us either correct over-grants (most likely outcome) or defend our framework with data (less likely but credible). The Comp Committee discussion is sensitive but necessary. Cost: Comp Committee bandwidth and possibly some employee retention friction if grants reduce. Benefit: removing the activist-driven discount on the stock and restoring credibility on operating leverage.",
    },
  },
  {
    id: "fin-i6", domain: "finance",
    finding: "Customer Acquisition Cost has risen 60% over 18 months, from $215 to $344. LTV has grown only 12% in the same period (from $890 to $997). LTV:CAC has fallen from 4.1 to 2.9. CFO is questioning whether to continue funding growth investment at current levels.",
    context: "DTC consumer brand, $85M annual revenue. Marketing spend is 22% of revenue. Recent shift to performance-marketing-heavy mix (paid social grew from 30% to 55% of marketing budget).",
    goldStandard: {
      insight: "The unit economics narrative is real but mis-attributed. CAC didn't rise because acquisition got harder broadly — it rose because the channel mix shifted toward paid social, which has a lower LTV per acquired customer. The same dollar spent on email or referral generates different value than on paid social. Treating CAC as one number hides this.",
      recommendation: "Decompose CAC and LTV by channel and rebalance spend toward channels where LTV:CAC remains above 3:1. Specifically: cap paid social at current spend (don't cut yet) and reinvest incremental marketing into email, organic content, and referral programs that historically drive higher-LTV customers. Reset performance review to channel-level LTV:CAC, not blended.",
      measurement: "Primary: blended LTV:CAC ratio (target return to 3.5+). Secondary: channel-level LTV:CAC, monthly. Cut criterion: if blended ratio doesn't recover within 6 months, the issue is broader CAC inflation across all channels (market saturation), not mix; revisit overall growth investment level.",
      pitchAnchor: "Our CAC isn't broken at the company level — it's broken at the channel level. Paid social dragged the blended CAC up because we scaled spend without scaling LTV per customer. Capping paid social and reinvesting in higher-LTV channels (email, referral) should restore LTV:CAC to 3.5+ within 6 months without cutting growth investment. The harder conversation is with the marketing team that scaled paid social — they did what they were measured on; the measurement was wrong.",
    },
  },

  // OPERATIONS / SUPPLY CHAIN — 6 scenarios
  {
    id: "ops-i1", domain: "operations",
    finding: "On-time delivery has fallen from 96% to 88% over six months. Root cause analysis shows that 78% of late deliveries are stockouts, not transit delays. Forecast accuracy has held steady at 82% (within historical norms), but actual demand for the affected SKUs has trended 15-20% above forecast for 12 weeks.",
    context: "Mid-market consumer goods supplier serving major retail customers. Stockouts trigger contractual OTD penalties of 2-4% of order value plus reputational risk with key accounts.",
    goldStandard: {
      insight: "Forecast accuracy is fine on average — we're missing on a specific category that the forecasting model didn't see coming. 12 weeks of consistent over-forecast on the same SKUs is no longer noise; it's a structural demand shift the model hasn't adapted to. The OTD problem is downstream of the planning blind spot.",
      recommendation: "Override the forecast on the affected SKUs with a 15-20% upward adjustment for the next 12 weeks while we investigate the underlying demand driver. In parallel, add a forecast bias monitor that flags any SKU running >10% in the same direction for 6+ weeks for human review. This isn't a forecast accuracy problem — it's a forecast adaptiveness problem.",
      measurement: "Primary: stockout rate on affected SKUs, weekly. Secondary: aggregate OTD rate. Cut criterion: if the upward adjustment overshoots and creates excess inventory, recalibrate to a lower buffer; the goal is matching the trend, not over-stocking.",
      pitchAnchor: "Our OTD failure is a planning blind spot, not an execution problem. The forecast is right on average and wrong in a specific, persistent way that the model hasn't learned. A manual override plus a bias-monitoring rule restores OTD within 30 days and prevents this from recurring on a different SKU set. The cost is some inventory carrying risk if the demand trend reverses; the benefit is stopping the OTD penalty bleed and the customer-relationship damage.",
    },
  },
  {
    id: "ops-i2", domain: "operations",
    finding: "Manufacturing OEE has dropped from 76% to 61% on the main production line over 8 months. Decomposed, Availability fell from 92% to 78% (the dominant driver), Performance is stable, and Quality is up slightly.",
    context: "Manufacturing plant, single critical line. Each percentage point of OEE represents ~$340K in annual contribution margin. Maintenance budget was cut 18% two years ago.",
    goldStandard: {
      insight: "We're paying for the maintenance cuts of two years ago in unplanned downtime today. Availability dropped 14pp while Performance and Quality held — that's the textbook signature of equipment reliability degrading from deferred maintenance, not a process or training failure. The lag from cause to effect is real and predictable.",
      recommendation: "Restore the maintenance budget plus add a 'catch-up' allocation for the next 12 months to address the deferred work that accumulated. Pair with predictive maintenance instrumentation (vibration, temperature, current sensors) on the critical line to prevent recurrence. This is a $2-3M one-time investment to recover $5-6M annual contribution margin.",
      measurement: "Primary: Availability component of OEE, monthly. Secondary: unplanned downtime hours by failure mode. Cut criterion: if Availability doesn't recover within 6 months of restored maintenance, the equipment may be at end of life; capital replacement decision required.",
      pitchAnchor: "We saved $2M in maintenance budget over two years and we're losing $5M annually in OEE to show for it. Restoring the budget plus a catch-up allocation, paired with predictive maintenance instrumentation, should recover Availability within 6 months and prevent the next round of this. The harder conversation is whether the original budget cut was wrong; data here suggests yes, but the alternative is accepting the OEE level as the new normal.",
    },
  },
  {
    id: "ops-i3", domain: "operations",
    finding: "Cost per order shipped has risen 18% YoY, from $7.15 to $8.42. Decomposition shows that freight cost per order rose 24% (the largest driver), driven by a shift from ground to expedited shipping for 35% of orders to meet faster delivery promises.",
    context: "DTC fulfillment, 250K orders/month. Customer-facing delivery promise was tightened 14 months ago (from '5-7 days' to '3-5 days') as a competitive response.",
    goldStandard: {
      insight: "The cost increase isn't a freight rate problem — it's a product promise problem. We tightened the delivery window without rebuilding the network to support it, so we're paying expedited rates to compensate for a network that was designed for the old promise. We made a marketing decision and let it become an unbudgeted operational expense.",
      recommendation: "Either invest in network expansion (add 2-3 fulfillment nodes to make ground shipping reach 3-5 days for >85% of orders) or relax the delivery promise back toward 4-6 days for non-Premium orders, reserving the 3-5 day promise as a Premium-tier benefit. Don't keep the promise without paying for the network.",
      measurement: "Primary: freight cost per order. Secondary: customer satisfaction and conversion impact on relaxed-promise scenarios. Cut criterion: if expanded network doesn't reduce freight cost per order by 12-15% within 18 months, the network design itself is suboptimal; revisit node selection.",
      pitchAnchor: "We're paying $4M annually in unbudgeted expedited freight because we changed our delivery promise without changing the network. Two paths: invest $8-12M in fulfillment nodes to make the promise affordable, or relax the promise selectively and recover the cost. Either way, the current state isn't sustainable. The recommendation depends on whether the tightened promise actually drove conversion lift; if marketing data shows it did, expansion pays back; if not, relaxation is the right move.",
    },
  },
  {
    id: "ops-i4", domain: "operations",
    finding: "Recordable incident rate (TRIR) has doubled in 12 months, from 1.8 to 3.6. The increase is concentrated on second shift (6pm-2am), which has 40% new hires (vs. 12% on first shift). Severity-weighted incidents (DART) rose only 22%, indicating most new incidents are minor.",
    context: "Distribution center, 600 associates total. Hiring surge of 240 new associates over 14 months to support volume growth. New hires receive a 3-day safety orientation before floor work.",
    goldStandard: {
      insight: "The incident rate doubled because we doubled new-hire density without scaling safety mentorship. New employees are 3-5× more likely to have incidents in their first 90 days; concentrating them on a single shift with thin onboarding is a known recipe for the rate we're seeing. The severity gap (DART up 22%, TRIR up 100%) tells us most incidents are minor — confirming inexperience, not negligence.",
      recommendation: "Restructure second-shift onboarding: pair every new hire with a designated mentor (existing associate, not just a supervisor) for the first 30 days, with explicit safety check-ins at days 7, 14, and 30. Cap second-shift new-hire density at 25% of headcount during the rebalancing period — backfill via internal first-shift transfers.",
      measurement: "Primary: incident rate by shift, weekly. Secondary: 90-day incident rate for new hires (target: drop from current trend). Cut criterion: if rate doesn't fall within 60 days of mentorship rollout, the issue is procedural (e.g., equipment, layout, work design) rather than experience-driven.",
      pitchAnchor: "Our safety incident rate doubled because we created a high-density new-hire environment on second shift without the mentorship infrastructure to support it. Pairing every new hire with a mentor and capping new-hire density at 25% per shift should bring TRIR back below 2.5 within 90 days. The cost is mentorship pay incentive (~$120K annually); the benefit is reduced workers' comp exposure plus the cultural value of treating safety as a leading indicator, not just a lagging metric.",
    },
  },
  {
    id: "ops-i5", domain: "operations",
    finding: "Inventory turnover dropped from 8× to 5× over 12 months despite stable revenue. ABC analysis shows that A-velocity items (top 20% of SKUs by sales) are still turning at 12×, but C-velocity items (bottom 50% of SKUs) have dropped from 4× to 1.8×.",
    context: "Specialty retail with seasonal product cycles. Total inventory $48M, of which C-velocity items now represent $19M (up from $11M a year ago). Storage and obsolescence cost ~14% of inventory value annually.",
    goldStandard: {
      insight: "The inventory bloat is concentrated in low-velocity SKUs that are accumulating without selling — we're hoarding our slowest movers. A-velocity is healthy; C-velocity has become a graveyard. Each $1M of stale C-inventory costs us $140K annually in carrying cost, plus eventual markdown losses. The aggregate turnover number masks where the actual problem lives.",
      recommendation: "Implement a quarterly C-velocity review: any SKU below 2× turnover for 2 consecutive quarters gets a markdown, liquidation, or discontinuation decision. Reduce C-velocity SKU count by 30% over 18 months, redirecting that working capital to expanding A-velocity depth and breadth.",
      measurement: "Primary: C-velocity inventory value. Secondary: total inventory turnover, gross margin (markdowns will pressure short-term). Cut criterion: if C-velocity reduction triggers customer complaints about assortment depth in specific categories, the cuts were too deep there; recalibrate by category.",
      pitchAnchor: "We have $19M sitting in C-velocity inventory generating $2.7M annual carrying cost without proportional revenue. A quarterly velocity review with explicit thresholds for markdown or discontinuation can free $5-7M of working capital within 18 months and reduce ongoing carrying cost by ~$1M annually. The harder conversation is with merchants who advocate for assortment breadth; the data shows breadth has crossed into clutter for half the catalog.",
    },
  },
  {
    id: "ops-i6", domain: "operations",
    finding: "Supplier on-time delivery from our top supplier dropped from 98% to 84% over six months. The supplier attributes this to our forecast volatility. Our forecast MAPE for items from this supplier has risen from 18% to 31%, but is unchanged for other suppliers serving the same product categories.",
    context: "Manufacturing supply chain. Top supplier represents 35% of input materials by spend. Switching cost is high (qualification cycle is 9-12 months).",
    goldStandard: {
      insight: "The supplier's complaint about our forecast volatility is real — but it's a problem we created and only experience with this supplier. Same categories, other suppliers, same forecast-driven environment, no MAPE issue. Something specific about our forecasting or order pattern with this supplier has changed in a way that didn't change elsewhere. We don't know the cause yet.",
      recommendation: "Audit the planning workflow specific to this supplier: are orders being placed at different lead times than other suppliers? Has the SKU mix shifted toward higher-variability items? Have we added emergency expedites that distort the steady-state pattern? Investigate before committing to a fix; the supplier may be partly right and partly using our forecast as cover for their own capacity issues.",
      measurement: "Primary: forecast MAPE by supplier, weekly. Secondary: supplier OTD by supplier, weekly. Investigation milestone: 4-week diagnostic before deciding on countermeasures. Cut criterion: if forecast pattern changes don't explain the MAPE divergence, supplier capacity is the real issue and contract conversation is needed.",
      pitchAnchor: "Our supplier is partly right and we don't know how much. Forecast MAPE specifically for their items has doubled while staying stable elsewhere — that's not random noise, it's something we changed in our planning process for them. A 4-week diagnostic of the planning workflow specific to this supplier costs us one analyst's time and gives us either a fix or a clean basis to push back. Going into contract conversations without this diagnostic means we accept their narrative; doing the work first means we either fix our problem or have data to renegotiate from.",
    },
  },

  // MARKETING — 6 scenarios
  {
    id: "mkt-i1", domain: "marketing",
    finding: "Blended ROAS dropped from 3.2× to 1.9× over the past year. Channel-level decomposition shows email/CRM ROAS held at 8×, paid search dropped from 4× to 2.5×, and paid social collapsed from 2.5× to 0.8×. Paid social spend is 52% of total marketing budget.",
    context: "DTC consumer brand, $24M annual marketing spend. Performance-marketing-heavy mix. Customer LTV stable at $142.",
    goldStandard: {
      insight: "Our blended ROAS isn't broken — paid social is broken, and it's 52% of the budget, so it drags everything down. Email and paid search are healthy. Continuing to fund paid social at current levels means accepting structural unprofitability per dollar spent there. This isn't optimization territory; it's allocation territory.",
      recommendation: "Cut paid social budget by 50% immediately and reinvest into email/CRM expansion (proven 8× ROAS) and paid search scale. Don't try to optimize paid social at current spend; the channel may have audience saturation or platform-level efficiency decay we can't fix at this scale. Test smaller paid social experiments (~10% of original budget) to determine if the channel works at any volume.",
      measurement: "Primary: blended ROAS (target return to 2.8+). Secondary: channel-level ROAS, monthly. Cut criterion: if blended ROAS doesn't recover within 6 months, the issue is broader than paid social mix.",
      pitchAnchor: "Half our marketing budget is going to a 0.8× ROAS channel and we're calling it growth investment. Cutting paid social 50% and reinvesting into email and search should restore blended ROAS to ~2.8 within 60 days. Risk: short-term volume of new customer acquisition will drop while reallocation happens; the LTV-quality of customers should improve. The political conversation is with the agency that built the paid social program, but the data is unambiguous.",
    },
  },
  {
    id: "mkt-i2", domain: "marketing",
    finding: "Email open rates have fallen from 32% to 19% over 18 months. Sender reputation score is at 89 (above Gmail's 80 threshold but below the 95+ historical level). The drop accelerated after we expanded the list 40% via aggressive lead-magnet acquisition.",
    context: "DTC apparel brand. Email is 38% of revenue. List size is 1.4M.",
    goldStandard: {
      insight: "We grew the list and degraded its quality, and our email reputation is paying the price. The lead-magnet subscribers are likely opening less, marking more as spam, and pulling down sender reputation — which then suppresses delivery to our engaged subscribers. We're harming the asset that generates 38% of revenue to feed the asset that doesn't yet.",
      recommendation: "Implement an aggressive list hygiene program: any subscriber with zero opens in 90 days enters a re-engagement sequence; failure to re-engage within 30 days = removal. Set a sunset policy of 6 months of inactivity = automatic removal. Pause lead-magnet-only acquisition until reputation recovers; require minimum demonstrated intent (e.g., browsed product page) before adding to active sends.",
      measurement: "Primary: open rate trend, sender reputation score. Secondary: total email revenue (must hold or grow despite list shrinkage). Cut criterion: if list shrinkage of 30%+ doesn't recover open rate within 90 days, the issue is content/cadence, not deliverability.",
      pitchAnchor: "We grew our list by 40% and broke the channel that generates 38% of revenue. Aggressive list hygiene plus tighter acquisition criteria should shrink the list 25-30% but recover open rate to 28%+ within 90 days. Total revenue should hold because we're cutting subscribers who weren't generating revenue anyway. The harder conversation is with the team that built the lead-magnet program — they were measured on list growth, and they delivered; the metric was wrong.",
    },
  },
  {
    id: "mkt-i3", domain: "marketing",
    finding: "Lead volume from paid search is up 40% YoY but sales-qualified rate dropped from 22% to 14%. Sales team complaints about lead quality have increased significantly. The volume increase is driven by expansion into broader keyword categories.",
    context: "B2B SaaS, $32M ARR. Sales cycle averages 90 days. Average deal size $48K.",
    goldStandard: {
      insight: "We optimized for lead volume and got it; we didn't optimize for lead quality and lost it. The keyword expansion brought top-of-funnel intent (researching, exploring) instead of buying intent. Marketing hit its volume target while making sales' job harder, and the actual outcome — sales-qualified leads — went down despite more total leads.",
      recommendation: "Refocus paid search on bottom-funnel keywords (high commercial intent: 'pricing,' 'demo,' 'compare X vs Y'). Reduce or eliminate spend on top-funnel research keywords. Add lead scoring at the form-fill level so sales can prioritize, but the upstream fix is the keyword mix. Realign marketing's measurement to SQLs delivered, not leads generated.",
      measurement: "Primary: SQL volume per dollar of paid search spend. Secondary: total lead volume (will drop; that's expected). Cut criterion: if SQL volume drops more than 15% in the first 60 days, the bottom-funnel keyword space is too thin to support our spend; revisit channel allocation.",
      pitchAnchor: "We hit our lead volume target by chasing the wrong leads. Refocusing paid search on bottom-funnel keywords reduces volume but should increase SQL volume by 25-35% within 90 days. Sales team velocity recovers because they spend less time on bad-fit leads. The KPI conversation is the harder part: marketing has been measured on leads, not SQLs, and that has to change for the fix to stick.",
    },
  },
  {
    id: "mkt-i4", domain: "marketing",
    finding: "Organic search traffic dropped 35% over 60 days. Affected pages are concentrated in informational/blog content (down 52%); commercial pages are down only 8%. The drop coincides with a Google AI Overviews expansion in the brand's category.",
    context: "DTC home goods brand. Organic search drives 28% of total traffic and ~$8M annual revenue. Content marketing has been a major investment area.",
    goldStandard: {
      insight: "We're not penalized — we're being disintermediated. Google's AI Overviews are answering informational queries directly in the search results, so users no longer click through to our blog content. Commercial pages are mostly fine because AI Overviews can't fulfill purchase intent. The traffic loss is structural, not algorithmic, and won't be solved by SEO optimization on existing content.",
      recommendation: "Pivot content strategy from 'win the click' to 'be cited in the AI Overview.' Restructure top-performing informational content into clear, citable answers with explicit data and source attribution. In parallel, accept that informational content will generate less direct traffic and reweight investment toward commercial-intent content where AI Overviews don't compete.",
      measurement: "Primary: cited mentions in AI Overviews for target queries (use SERP monitoring tools). Secondary: brand search volume (a leading indicator of brand awareness even when click-through suffers). Cut criterion: if AI citation volume doesn't grow within 6 months, the disintermediation is permanent at our content quality level.",
      pitchAnchor: "Our organic traffic problem isn't a Google algorithm problem — it's a Google product change. AI Overviews are stealing clicks from informational queries, and our content investment was concentrated there. Reweighting toward citation-friendly formats and commercial-intent content can recover some of the loss, but the bigger truth is that organic search ROI has structurally decreased for content brands. The strategic conversation is whether to keep investing in content at the same level given lower direct traffic capture.",
    },
  },
  {
    id: "mkt-i5", domain: "marketing",
    finding: "Brand campaign with $500K budget has been running for 6 months. Direct attributed revenue is $180K (negative ROI by direct measurement). However, branded search volume is up 47%, direct traffic is up 22%, and post-campaign performance marketing CAC has declined 18%.",
    context: "DTC fashion brand, $32M annual revenue. CMO needs to justify continued brand investment to a CFO who skeptically views the brand budget as 'unprovable spend.'",
    goldStandard: {
      insight: "Brand campaigns don't show ROI through direct attribution and never will — that's not how they work. The proof is in the secondary metrics: branded search up 47% means people are seeking us out; direct traffic up 22% means awareness translated to behavior; performance marketing CAC down 18% means brand work warmed audiences for paid acquisition. The 'negative ROI' framing measures the wrong thing.",
      recommendation: "Build a brand campaign measurement framework that explicitly tracks the secondary indicators alongside direct attribution: branded search lift, direct traffic lift, performance CAC reduction, and survey-based brand awareness lift. Calculate combined ROI as direct attribution + downstream CAC savings + estimated value of branded search/direct traffic increases. This produces a positive ROI story rooted in defensible mechanics.",
      measurement: "Primary: composite brand impact score (the framework above). Secondary: continued direct attributed revenue trend. Time horizon: every quarter, with annual cumulative review. Cut criterion: if the composite score doesn't show value within 12 months, brand investment is genuinely not paying back at this level; reduce.",
      pitchAnchor: "Our brand campaign is 'losing money' by direct attribution and 'making money' by every other metric — branded search up 47%, performance CAC down 18%, direct traffic up 22%. The CFO conversation isn't 'is brand worth it'; it's 'how do we measure brand correctly.' A composite measurement framework that captures all the indirect lift produces an ROI story we can defend. Without that framework, brand will always look like a loss because we're measuring it on a metric it's not designed to move.",
    },
  },
  {
    id: "mkt-i6", domain: "marketing",
    finding: "Influencer marketing program has spent $300K with 12 creators over 9 months. Direct attributed revenue (via tracked codes/links) is $95K. However, brand mentions in user-generated content have grown 220%, and engagement on owned social channels has tripled.",
    context: "DTC beauty brand. Marketing leadership is debating whether to scale, maintain, or kill the influencer program. Customer LTV averages $180.",
    goldStandard: {
      insight: "Direct attribution shows a 0.32× return — bad. Indirect signals (UGC up 220%, owned engagement 3×) show real cultural penetration that direct attribution can't capture. The same problem as brand campaigns: we're measuring what we can attribute, not what's actually happening. The question is whether the indirect lift produces revenue that's worth the spend, even if we can't link it 1:1.",
      recommendation: "Don't scale or kill yet — first build measurement that captures indirect lift. Survey new customers acquired in the campaign window for 'how did you first hear about us'; the share attributing influencers (vs paid social, vs friend/family) gives a more accurate picture. Add a brand awareness lift study comparing audiences exposed to influencer content vs control. Make the scale/maintain/kill decision after one more quarter with that data.",
      measurement: "Primary: % of new customers attributing influencer awareness in survey. Secondary: brand awareness lift among targeted demographics. Decision threshold: if direct attribution + survey-attributed share approaches break-even (1.0× combined), maintain at current level; if exceeds 1.5×, scale; if below 0.7×, kill.",
      pitchAnchor: "We can't tell if our influencer program is working because we're only measuring direct attribution. UGC up 220% and engagement tripled are real signals, but they don't translate directly to revenue we can credit. One more quarter of investment plus a measurement upgrade (survey + brand lift study) gets us a defensible scale/kill decision. Cost: one more quarter of program budget plus a $25K research investment. Benefit: stop debating the program and have data to act on.",
    },
  },  {
    id: "prod-i1", domain: "product",
    finding: "Feature adoption is at 12% after 60 days against a 35% target. However, users who did adopt the feature have a D30 retention rate of 71% — compared to 42% for non-adopters. The feature has been in the product for 60 days with a single in-product tooltip as the only promotion.",
    context: "B2C mobile app, 2.4M MAU. Feature is a social sharing mechanic. Tooltip appeared on day 3 of the feature launch and is no longer showing to new users.",
    goldStandard: {
      insight: "The 12% adoption number is misleading — the feature is not underperforming on value, it's underperforming on discoverability. The 71% vs 42% D30 retention gap (29pp) is one of the largest feature-lift signals in the dataset and is almost certainly causal, not correlational: users who engage with the social feature form habits. The business is leaving a significant retention intervention on the table by not driving adoption.",
      recommendation: "Run a 30-day discoverability campaign: surface the feature at three additional moments (post-core-action completion, on the user's 7th session, and via a push notification for users who have not discovered it). A/B test contextual prompts vs. control to measure incrementally-driven adoption. Target 40% adoption within 60 days of the campaign.",
      measurement: "Primary: feature adoption rate (target 40% within 60 days of campaign). Secondary: D30 retention for campaign-driven adopters vs organic adopters (verify the retention lift holds for non-self-selected users). Cut criterion: if campaign-driven adoption shows D30 retention below 60% (vs organic adopter 71%), the lift is partly self-selection and the adoption push has lower value than the organic data suggests.",
      pitchAnchor: "We have a 29pp retention advantage sitting at 12% adoption because users aren't finding the feature. A targeted discoverability campaign surfacing the feature at three contextual moments should triple adoption within 60 days; if the retention lift holds for campaign-driven adopters, we're looking at a measurable impact on overall platform D30 retention. The only cost is engineering time for the entry points and campaign logic — no new feature investment required.",
    },
  },
  {
    id: "prod-i2", domain: "product",
    finding: "D7 retention dropped 8 percentage points (from 48% to 40%) in the two cohorts that signed up after a major navigation redesign. D30 retention for pre-redesign cohorts is holding stable at 38%. App Store reviews in the 30 days post-redesign show 'can't find X' and 'where did Y go' mentions increasing 4× over baseline.",
    context: "Consumer productivity app, 800K MAU. Navigation redesign was driven by a design refresh, not user feedback. The previous nav has been archived but not deleted from the codebase.",
    goldStandard: {
      insight: "The redesign introduced new-user-specific navigation friction that is costing 8pp of D7 retention — but because long-tenured users have already learned the product, their retention is unaffected. The 'can't find X' review spike is the causal evidence: new users are abandoning before learning the new navigation, not because the product's core value changed.",
      recommendation: "Roll back the navigation for new users only (using a feature flag) while maintaining the redesign for existing users, then measure whether new user D7 retention recovers. In parallel, redesign the new-user navigation with contextual onboarding overlays that explicitly map 'where things moved.' Do not roll back for existing users — the redesign is working for them.",
      measurement: "Primary: D7 retention for new user cohorts on rolled-back navigation vs current redesign (expect 5-8pp recovery). Secondary: App Store review sentiment. Time horizon: 4-week cohort comparison. Cut criterion: if rollback doesn't recover D7 retention by at least 4pp, the navigation isn't the primary driver and a deeper onboarding investigation is needed.",
      pitchAnchor: "We dropped 8pp of D7 retention because new users can't find features they're looking for in the new navigation. Rolling back for new users while keeping the redesign for existing users — a feature flag, not a re-build — costs one engineering sprint and tests the hypothesis directly. If D7 retention recovers, we have a clear diagnosis and a focused fix. If it doesn't, we've ruled out navigation and can investigate onboarding content instead. The cost of not acting is approximately 8pp of retention per new user cohort, compounding monthly.",
    },
  },
  {
    id: "prod-i3", domain: "product",
    finding: "DAU has grown 22% over the past 6 months. However, DAU/MAU stickiness has declined from 38% to 29% in the same period. New user acquisition is up 45% driven by a paid social campaign. Organic acquisition has held flat.",
    context: "Consumer social app. Paid social campaign launched 6 months ago and is the primary driver of new user growth. Paid social users have D30 retention of 28% vs organic users at 51%.",
    goldStandard: {
      insight: "DAU growth is real but the stickiness decline reveals it's built on a leaky foundation. The paid social campaign is flooding the top of the funnel with users who retain at 28% — less than half the rate of organic users — and their presence in MAU is diluting the stickiness ratio. The headline DAU number is growing while the underlying product health is deteriorating.",
      recommendation: "Cap paid social spend at current levels and redirect new budget toward channels with proven retention (referral program expansion, SEO/content, community-driven acquisition). Set a stickiness recovery target of 34%+ within 3 months as the primary success metric for the acquisition strategy change. Maintain total DAU targets — just shift how they're achieved.",
      measurement: "Primary: DAU/MAU stickiness ratio (target 34%+ within 90 days). Secondary: blended D30 retention by cohort (must trend toward 40%+). Cut criterion: if stickiness doesn't recover within 60 days of channel shift, the organic channel cannot supply enough volume at the new budget level; revisit the mix at 45% paid social rather than cutting to current levels.",
      pitchAnchor: "Our DAU growth is masking a retention problem — we're acquiring users at 3× the normal rate who churn at 2× the normal rate, and the stickiness ratio tells that story. Shifting budget from paid social to referral and organic acquisition will slow DAU growth in the short term but rebuild the user base quality that drives LTV and monetization. The tradeoff is 2-3 months of slower headline growth for a durable stickiness recovery. That's the right trade given where we are.",
    },
  },
  {
    id: "prod-i4", domain: "product",
    finding: "New user activation rate (first core action completion within 7 days of signup) is 34% — below the 50% target. Users who don't activate by Day 3 have a 4% probability of ever activating. Users who activate by Day 1 have D30 retention of 58%; users who activate on Day 7 have D30 retention of 31%.",
    context: "B2B SaaS product, onboarding is self-serve. The core action is 'completing the first workflow.' Median time to first workflow completion is 4.2 days for those who eventually complete it.",
    goldStandard: {
      insight: "Activation timing is as important as activation itself — a Day 1 completer has 87% higher D30 retention than a Day 7 completer. Combined with the fact that users who don't activate by Day 3 have essentially zero probability of ever doing so, we have a 72-hour window to drive first core action completion, and most users are currently outside that window at 4.2-day median TTV.",
      recommendation: "Redesign the onboarding flow to drive first workflow completion within 24 hours of signup. Specifically: reduce the steps between signup and first workflow to 3 or fewer, pre-populate a sample workflow users can complete in one click, and send a 'complete your first workflow' email at the 4-hour mark for users who haven't started. Target Day 1 activation rate of 40%.",
      measurement: "Primary: Day 1 activation rate (target 40% vs current ~18%). Secondary: D30 retention for new cohorts (should shift toward 58% as Day 1 activations grow). Cut criterion: if onboarding redesign doesn't lift Day 1 activation by 10pp within 30 days, the barrier is not UX friction but user intent — the signup flow is attracting users who aren't ready to use the product, which requires a different fix.",
      pitchAnchor: "We have a 72-hour window to activate new users and we're currently missing it at 4.2-day median TTV. Every day we add to TTV costs us roughly 4pp of D30 retention. Redesigning onboarding to drive Day 1 completion — pre-populated workflow, fewer steps, 4-hour email trigger — is a 3-sprint investment that should lift D30 retention by 8-12pp across all new cohorts. That's the highest-ROI product investment available right now.",
    },
  },
  {
    id: "prod-i5", domain: "product",
    finding: "The top 10% of users (by core action frequency) generate 72% of all core actions and have a D365 retention rate of 84%. The bottom 50% of users generate 8% of core actions and have a D365 retention rate of 12%. The product monetizes via a flat subscription fee regardless of usage level.",
    context: "Consumer productivity app, $9.99/month subscription. 480K paying subscribers. Revenue is flat despite DAU growth because churn is offsetting new subscriptions.",
    goldStandard: {
      insight: "The flat subscription model is misaligned with the usage distribution. Power users who generate 72% of value are paying the same as casual users who barely use the product — and casual users are churning at high rates because they can't justify $9.99 for low perceived value. The business is subsidizing a power user base while failing to monetize the high-value segment and churning the low-value segment.",
      recommendation: "Test a usage-tiered pricing model: a free or lower-cost tier for low-frequency users and a premium tier for power users with additional features (advanced analytics, priority support, API access). Power users who generate 72% of engagement will likely accept premium pricing; casual users on a free/lower tier will have less reason to churn. This both reduces churn and opens a revenue upside with power users.",
      measurement: "Primary: overall subscriber churn rate (target reduction from current level by 4pp within 6 months). Secondary: ARPU (Average Revenue Per User — should increase as power users move to premium). Cut criterion: if power user upgrade rate to premium is below 30%, the pricing differential isn't compelling enough; adjust the premium feature set before scaling the rollout.",
      pitchAnchor: "We have 84%-retained power users paying the same $9.99 as 12%-retained casual users. Tiered pricing fixes both problems simultaneously: casual users get a lower-cost tier that reduces churn from 'can't justify the price,' and power users get a premium tier that captures revenue proportional to the value they're extracting. The risk is some power users downgrade instead of upgrading — we mitigate that by making the premium tier genuinely valuable for their use case. Revenue impact depends on the split, but even a 25% power user upgrade rate at $19.99 is meaningfully accretive.",
    },
  },
  {
    id: "prod-i6", domain: "product",
    finding: "Push notification CTR has declined from 6.2% to 3.1% over 8 months. During the same period, notification send volume per user increased 2.4× as the team added new notification types. Opt-out rate has increased from 3.8% to 7.4% per month.",
    context: "Consumer mobile app, 1.8M MAU. Push notifications drive approximately 28% of daily sessions. Current notification strategy: 6-8 notifications per user per week across 4 notification types.",
    goldStandard: {
      insight: "The notification program is in a death spiral: higher send volume drove lower CTR (notification fatigue), which drove higher opt-out rates, which will reduce DAU as opted-out users lose their primary re-engagement trigger. At 7.4% monthly opt-out, the opted-in user base will shrink 55% in 12 months if the trend continues — representing a structural threat to DAU.",
      recommendation: "Implement a notification frequency cap of 3 per user per week and a relevance filter that only sends notifications with predicted CTR above 4% (based on user behavior and notification type). Retire the two lowest-CTR notification types entirely. Monitor opt-out rate weekly as the primary success metric — it should recover within 4-6 weeks of volume reduction.",
      measurement: "Primary: monthly opt-out rate (target return to 4% within 60 days). Secondary: DAU from notification-driven sessions (must not decline more than 10% — frequency reduction will reduce absolute sessions but should improve per-notification CTR enough to partially offset). Cut criterion: if opt-out rate doesn't respond to volume reduction within 30 days, the problem is notification content quality, not volume.",
      pitchAnchor: "We doubled notification volume and halved CTR — the data shows exactly the elasticity point where more became less. At current opt-out rates, half our notification audience is gone in 12 months and we lose 28% of daily sessions with them. Cutting volume by 60% and retiring the lowest-CTR types will reduce absolute notification sessions in the short term but stabilize the opt-in base that drives long-term DAU. The tradeoff is accepting a 10-15% short-term DAU dip to prevent a 25-30% structural decline. That's not a hard tradeoff.",
    },
  },
  {
    id: "prod-i7", domain: "product",
    finding: "K-factor has declined from 0.7 to 0.2 over two quarters. Decomposed: invitation send rate per active user dropped from 0.9 invitations per week to 0.3, while invitation-to-signup conversion rate held stable at 22%. A referral incentive change (from $20 cash to a 1-month free subscription) was made at the start of the decline period.",
    context: "B2C subscription app, $14.99/month. Referral program previously contributed 18% of new user acquisition.",
    goldStandard: {
      insight: "The K-factor decline is entirely driven by the incentive change — conversion rate held, which rules out a landing page or product value problem. Changing the incentive from $20 cash (universally valuable) to a 1-month subscription (valuable only to users who plan to stay) reduced invitation send rate by 67%. The incentive change implicitly selected for a different type of referrer: users who are confident they'll keep the subscription, rather than all users who want $20.",
      recommendation: "Restore a cash incentive option ($15-20) as the primary referral reward, or test a hybrid: users can choose between $15 cash or 2 months free (to capture both preferences). A/B test the hybrid vs cash-only against the current subscription-only incentive, measuring both send rate and referred user LTV (cash-incentivized referrers may import lower-quality users who wanted the cash, not the product).",
      measurement: "Primary: K-factor (target recovery to 0.6+ within 60 days of incentive change). Secondary: D30 retention of referred users per incentive type (cash vs subscription incentive — verify quality holds with cash incentive). Cut criterion: if referred user D30 retention drops below 35% with cash incentive (vs the stable 22% conversion rate suggesting solid intent), the cash incentive is importing poor-quality users; keep subscription incentive but add a free trial extension as the cash alternative.",
      pitchAnchor: "We cut K-factor by 70% with an incentive change that saved roughly $2 per referred user in incentive cost while costing us 15% of new acquisition volume. The math doesn't work. Restoring a cash equivalent incentive should recover K-factor within 60 days; if referred user quality holds, the acquisition cost savings from viral growth far exceed the incentive cost increase. The only question we need to answer is whether cash-incentivized referrers bring lower-quality users — that's a 30-day A/B test, not a debate.",
    },
  },

];

// ── MODE 4 COMPONENT ───────────────────────────────────────────────────────

function InsightRecMode({ apiKey, progress, onScore }) {
  const [activeDomain, setActiveDomain] = useState("retail");
  const [scenarioIdx, setScenarioIdx] = useState(0);
  const [stage, setStage] = useState("input");      // input, submitted, graded
  const [insight, setInsight] = useState("");
  const [recommendation, setRecommendation] = useState("");
  const [measurement, setMeasurement] = useState("");
  const [pitch, setPitch] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const domainScenarios = INSIGHT_SCENARIOS.filter(s => s.domain === activeDomain);
  const scenario = domainScenarios[scenarioIdx];
  const domainObj = KPI_DOMAINS.find(d => d.id === activeDomain);
  const domainColor = domainObj?.color || C.accent;

  const handleDomainChange = (id) => {
    setActiveDomain(id);
    setScenarioIdx(0);
    resetForm();
  };

  const resetForm = () => {
    setStage("input");
    setInsight("");
    setRecommendation("");
    setMeasurement("");
    setPitch("");
    setFeedback(null);
    setError("");
  };

  const grade = async () => {
    if (!apiKey) { setError("Add your Anthropic API key above to grade your reasoning."); return; }
    if (!insight.trim() || !recommendation.trim() || !measurement.trim() || !pitch.trim()) {
      setError("Fill in all four fields before grading.");
      return;
    }

    setLoading(true);
    setError("");

    const prompt = `You are a senior data analyst evaluating a junior analyst's insight, recommendation, and pitch on a business finding.

DOMAIN: ${activeDomain}

THE FINDING:
${scenario.finding}

CONTEXT:
${scenario.context}

GOLD-STANDARD ANSWERS (what a senior analyst would say):
INSIGHT: ${scenario.goldStandard.insight}
RECOMMENDATION: ${scenario.goldStandard.recommendation}
MEASUREMENT: ${scenario.goldStandard.measurement}
VP PITCH: ${scenario.goldStandard.pitchAnchor}

USER'S ANSWERS:
INSIGHT: ${insight}
RECOMMENDATION: ${recommendation}
MEASUREMENT: ${measurement}
VP PITCH: ${pitch}

Grade the user against these four common junior-analyst failure modes:
1. Stopping at description instead of prescription (insight stays observational, doesn't connect to action)
2. Recommendations that aren't actionable (vague, generic, no specific intervention)
3. Missing the tradeoff or cost (no acknowledgment that every recommendation has a downside or cost)
4. No measurement plan (can't articulate how to know if it worked, or measurement is generic)

Output structured plain text in this exact format:

INSIGHT_SCORE: [0-3]
INSIGHT_FEEDBACK: [1-2 sentences on whether they translated data to business meaning]

RECOMMENDATION_SCORE: [0-3]
RECOMMENDATION_FEEDBACK: [1-2 sentences on actionability and specificity]

MEASUREMENT_SCORE: [0-3]
MEASUREMENT_FEEDBACK: [1-2 sentences on how well they defined success/failure criteria]

PITCH_SCORE: [0-3]
PITCH_FEEDBACK: [1-2 sentences on whether the pitch synthesizes the analysis with executive framing — concise, named tradeoffs, time horizon]

OVERALL: [strong, partial, or weak]
KEY_TAKEAWAY: [one sentence — the single most important framing they should have used]

Plain text only, no markdown. Be honest and discriminating — don't grade leniently. A "strong" rating should be reserved for senior-analyst-quality work; "partial" is the realistic ceiling for most junior responses.`;

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true",
        },
        body: JSON.stringify({
          model: "claude-opus-4-5",
          max_tokens: 2000,
          messages: [{ role: "user", content: prompt }],
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error?.message || `API error ${res.status}`);
      }
      const data = await res.json();
      const text = data.content?.[0]?.text || "";
      setFeedback(text);
      setStage("graded");

      const overallMatch = text.match(/OVERALL:\s*(strong|partial|weak)/i);
      if (overallMatch) {
        const score = overallMatch[1].toLowerCase();
        onScore(`intel-insight-${activeDomain}`, scenarioIdx, score, { q: scenario.finding.slice(0, 80) });
      }
    } catch (e) {
      setError(e.message || "Grading failed");
    }
    setLoading(false);
  };

  const next = () => {
    setScenarioIdx(i => (i + 1) % domainScenarios.length);
    resetForm();
  };

  const prev = () => {
    setScenarioIdx(i => (i - 1 + domainScenarios.length) % domainScenarios.length);
    resetForm();
  };

  return (
    <div>
      {/* Domain selector */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
        {KPI_DOMAINS.map(d => (
          <button
            key={d.id}
            onClick={() => handleDomainChange(d.id)}
            style={{
              padding: "7px 14px", borderRadius: 6, border: `1.5px solid ${activeDomain === d.id ? d.color : C.border}`,
              background: activeDomain === d.id ? d.color + "18" : "transparent",
              color: activeDomain === d.id ? d.color : C.muted,
              fontFamily: mono, fontSize: 10, cursor: "pointer", letterSpacing: "0.06em",
            }}
          >
            {d.icon} {d.label}
          </button>
        ))}
      </div>

      {/* Scenario nav */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <span style={{ fontFamily: mono, fontSize: 11, color: C.muted }}>
          Scenario {scenarioIdx + 1} of {domainScenarios.length}
        </span>
        <div style={{ display: "flex", gap: 6 }}>
          <button onClick={prev} style={{ padding: "5px 12px", borderRadius: 4, border: `1px solid ${C.border}`, background: "transparent", color: C.muted, fontFamily: mono, fontSize: 10, cursor: "pointer" }}>← Prev</button>
          <button onClick={next} style={{ padding: "5px 12px", borderRadius: 4, border: `1px solid ${C.border}`, background: "transparent", color: C.muted, fontFamily: mono, fontSize: 10, cursor: "pointer" }}>Next →</button>
        </div>
      </div>

      {/* Finding */}
      <div style={{ background: C.card, border: `1.5px solid ${domainColor}`, borderRadius: 12, padding: "16px 20px", marginBottom: 12 }}>
        <div style={{ fontFamily: mono, fontSize: 10, color: domainColor, letterSpacing: "0.12em", marginBottom: 8 }}>
          {domainObj?.icon} THE FINDING
        </div>
        <div style={{ fontSize: 14, color: C.text, lineHeight: 1.6, marginBottom: 12 }}>{scenario.finding}</div>
        <div style={{ fontFamily: mono, fontSize: 10, color: C.muted, letterSpacing: "0.12em", marginBottom: 6 }}>CONTEXT</div>
        <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.6 }}>{scenario.context}</div>
      </div>

      {/* Structured input fields */}
      <div style={{ background: C.card, border: `1.5px solid ${C.border}`, borderRadius: 12, padding: 18, marginBottom: 14 }}>
        <div style={{ fontFamily: mono, fontSize: 10, color: C.muted, letterSpacing: "0.12em", marginBottom: 14 }}>
          STEP 1 — STRUCTURED ANALYSIS
        </div>

        <div style={{ marginBottom: 14 }}>
          <div style={{ fontFamily: mono, fontSize: 10, color: domainColor, letterSpacing: "0.12em", marginBottom: 5 }}>
            INSIGHT — what does this finding mean in business terms?
          </div>
          <textarea
            value={insight}
            onChange={e => setInsight(e.target.value)}
            disabled={stage === "graded"}
            placeholder="Translate the data into business meaning. Don't just describe — interpret."
            style={{
              width: "100%", minHeight: 60, padding: "8px 10px",
              background: C.surface, border: `1px solid ${C.border}`, borderRadius: 5,
              color: C.text, fontSize: 12, fontFamily: "inherit", resize: "vertical",
            }}
          />
        </div>

        <div style={{ marginBottom: 14 }}>
          <div style={{ fontFamily: mono, fontSize: 10, color: domainColor, letterSpacing: "0.12em", marginBottom: 5 }}>
            RECOMMENDATION — what specific action with rationale?
          </div>
          <textarea
            value={recommendation}
            onChange={e => setRecommendation(e.target.value)}
            disabled={stage === "graded"}
            placeholder="Be specific. 'Improve X' is not actionable. Name the actual intervention."
            style={{
              width: "100%", minHeight: 70, padding: "8px 10px",
              background: C.surface, border: `1px solid ${C.border}`, borderRadius: 5,
              color: C.text, fontSize: 12, fontFamily: "inherit", resize: "vertical",
            }}
          />
        </div>

        <div style={{ marginBottom: 14 }}>
          <div style={{ fontFamily: mono, fontSize: 10, color: domainColor, letterSpacing: "0.12em", marginBottom: 5 }}>
            MEASUREMENT — how will you know if it worked?
          </div>
          <textarea
            value={measurement}
            onChange={e => setMeasurement(e.target.value)}
            disabled={stage === "graded"}
            placeholder="Primary metric, secondary metrics, time horizon, cut criterion."
            style={{
              width: "100%", minHeight: 70, padding: "8px 10px",
              background: C.surface, border: `1px solid ${C.border}`, borderRadius: 5,
              color: C.text, fontSize: 12, fontFamily: "inherit", resize: "vertical",
            }}
          />
        </div>
      </div>

      {/* Pitch field */}
      <div style={{ background: C.card, border: `1.5px solid ${C.border}`, borderRadius: 12, padding: 18, marginBottom: 14 }}>
        <div style={{ fontFamily: mono, fontSize: 10, color: C.muted, letterSpacing: "0.12em", marginBottom: 14 }}>
          STEP 2 — SYNTHESIS
        </div>
        <div style={{ fontFamily: mono, fontSize: 10, color: domainColor, letterSpacing: "0.12em", marginBottom: 5 }}>
          PITCH IT TO THE VP IN ONE PARAGRAPH
        </div>
        <div style={{ fontSize: 11, color: C.muted, marginBottom: 8, fontStyle: "italic" }}>
          Synthesize your analysis into a single paragraph an executive would actually act on. Name the tradeoff. Name the timeline. Name what success looks like.
        </div>
        <textarea
          value={pitch}
          onChange={e => setPitch(e.target.value)}
          disabled={stage === "graded"}
          placeholder="One paragraph. The thing you'd actually say in the meeting."
          style={{
            width: "100%", minHeight: 100, padding: "10px 12px",
            background: C.surface, border: `1px solid ${C.border}`, borderRadius: 5,
            color: C.text, fontSize: 13, fontFamily: "inherit", resize: "vertical",
          }}
        />

        <div style={{ marginTop: 14, display: "flex", gap: 8 }}>
          {stage === "input" && (
            <button onClick={grade} disabled={loading} style={{
              padding: "10px 24px", borderRadius: 6, border: `1.5px solid ${C.ok}`,
              background: C.ok + "18", color: C.ok,
              fontFamily: mono, fontSize: 11, cursor: loading ? "wait" : "pointer", letterSpacing: "0.06em",
            }}>
              {loading ? "Grading (this may take 15-30 sec)..." : "Grade with AI"}
            </button>
          )}
          {stage === "graded" && (
            <button onClick={resetForm} style={{
              padding: "10px 24px", borderRadius: 6, border: `1.5px solid ${C.border}`,
              background: "transparent", color: C.muted,
              fontFamily: mono, fontSize: 11, cursor: "pointer", letterSpacing: "0.06em",
            }}>
              Try Again
            </button>
          )}
        </div>
      </div>

      {error && (
        <div style={{ background: C.err + "15", border: `1px solid ${C.err}`, borderRadius: 8, padding: "12px 14px", marginBottom: 12, color: C.err, fontSize: 12 }}>
          {error}
        </div>
      )}

      {feedback && stage === "graded" && (
        <div style={{ background: C.card, border: `1.5px solid ${C.ok}`, borderRadius: 12, padding: 18 }}>
          <div style={{ fontFamily: mono, fontSize: 10, color: C.ok, letterSpacing: "0.12em", marginBottom: 10 }}>AI FEEDBACK</div>
          <pre style={{ whiteSpace: "pre-wrap", fontSize: 12, color: C.text, lineHeight: 1.65, fontFamily: mono, margin: 0 }}>{feedback}</pre>

          {/* Show gold-standard answers */}
          <div style={{ marginTop: 18, paddingTop: 16, borderTop: `1px solid ${C.border}` }}>
            <div style={{ fontFamily: mono, fontSize: 10, color: C.accent, letterSpacing: "0.12em", marginBottom: 12 }}>SENIOR-ANALYST GOLD STANDARD</div>

            <div style={{ marginBottom: 12 }}>
              <div style={{ fontFamily: mono, fontSize: 10, color: C.muted, marginBottom: 4 }}>INSIGHT</div>
              <div style={{ fontSize: 12, color: C.text, lineHeight: 1.6 }}>{scenario.goldStandard.insight}</div>
            </div>

            <div style={{ marginBottom: 12 }}>
              <div style={{ fontFamily: mono, fontSize: 10, color: C.muted, marginBottom: 4 }}>RECOMMENDATION</div>
              <div style={{ fontSize: 12, color: C.text, lineHeight: 1.6 }}>{scenario.goldStandard.recommendation}</div>
            </div>

            <div style={{ marginBottom: 12 }}>
              <div style={{ fontFamily: mono, fontSize: 10, color: C.muted, marginBottom: 4 }}>MEASUREMENT</div>
              <div style={{ fontSize: 12, color: C.text, lineHeight: 1.6 }}>{scenario.goldStandard.measurement}</div>
            </div>

            <div>
              <div style={{ fontFamily: mono, fontSize: 10, color: C.muted, marginBottom: 4 }}>VP PITCH</div>
              <div style={{ fontSize: 12, color: C.text, lineHeight: 1.6, fontStyle: "italic" }}>{scenario.goldStandard.pitchAnchor}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── SESSION 7: A/B TESTING & EXPERIMENTATION MODE ─────────────────────────
// New sub-mode under Intel. Format: experiment results presented → user makes
// ship/no-ship decision with structured reasoning. AI grades on 5 dimensions:
//   1. Statistical validity (significance, sample size, power)
//   2. Practical significance (effect size meaningful?)
//   3. Segment analysis (heterogeneous treatment effects?)
//   4. Threat identification (SRM, novelty, peeking, network effects)
//   5. Ship recommendation quality (clear, actionable, names tradeoffs)

const AB_TEST_SCENARIOS = [
  // RETAIL / E-COMMERCE — 3 scenarios
  {
    id: "ab-retail-1", domain: "retail",
    hypothesis: "Adding a 'free shipping at $75' progress bar in the cart will increase Average Order Value by motivating customers to add more items.",
    setup: "DTC apparel brand, 14-day test on desktop and mobile cart pages. Treatment shows progress bar; control shows current cart UI.",
    metrics: {
      treatment: { users: 48420, conversion: "3.8%", aov: "$84.20", revenue_per_user: "$3.20" },
      control:   { users: 48180, conversion: "3.6%", aov: "$72.10", revenue_per_user: "$2.60" },
    },
    results: "Conversion rate: +0.2pp (p=0.18, not significant). AOV: +$12.10 (p<0.001). Revenue per user: +$0.60 (p<0.001). 95% CI on revenue per user lift: [+$0.42, +$0.78].",
    segments: "Mobile users: +$0.85 lift (p<0.001). Desktop users: +$0.21 lift (p=0.12). New customers: +$1.20 lift. Returning customers: +$0.32 lift.",
    redFlags: "Test ran during a 14-day window that included a promotional weekend (BOGO sale on accessories). Sample sizes balanced across treatment and control.",
    goldStandard: {
      validity: "Statistically valid on the primary metric (revenue per user, p<0.001 with tight CI). Conversion rate is not significant but that's not the primary metric. Sample sizes are balanced. The 14-day duration is adequate for AOV measurement.",
      practical: "Practically significant — $0.60 incremental revenue per user across the user base translates to substantial annual revenue. The AOV lift of $12.10 (+17%) is meaningful for a free shipping intervention.",
      segmentation: "Heterogeneous treatment effects are present: mobile users drive most of the lift, desktop users show no significant effect. This suggests the progress bar is more visible/impactful on mobile screens. Ship decision should account for this — possibly mobile-only rollout while we investigate desktop UX.",
      threats: "The promotional weekend (BOGO accessories) is a confound that may have inflated AOV in both treatment and control. Verify the AOV lift is not driven by promotional purchases by re-running analysis with promo orders excluded. Also verify Sample Ratio Match (SRM) is healthy — a 0.5% SRM difference at this sample size warrants a check.",
      shipDecision: "Ship for mobile users with a follow-up test on desktop using a more prominent visual treatment. Validate AOV lift holds when promo orders are excluded. Set guardrail metric: customer return rate (free shipping incentivizes ordering items customers may return).",
    },
  },
  {
    id: "ab-retail-2", domain: "retail",
    hypothesis: "Replacing the 'Sign up for 10% off' homepage modal with a 'Sign up to track your order' modal will increase email capture rate without harming conversion.",
    setup: "DTC home goods, 21-day test on homepage. Treatment: order-tracking modal. Control: existing 10%-off modal. Both modals exit-intent triggered.",
    metrics: {
      treatment: { users: 142000, email_signup: "12.4%", purchase_conversion: "2.1%", revenue_per_session: "$1.42" },
      control:   { users: 141200, email_signup: "18.2%", purchase_conversion: "2.6%", revenue_per_session: "$1.78" },
    },
    results: "Email signup: -5.8pp (p<0.001). Purchase conversion: -0.5pp (p<0.001). Revenue per session: -$0.36 (p<0.001). 95% CI on revenue per session: [-$0.48, -$0.24].",
    segments: "All segments showed negative effects. Magnitude consistent across new vs returning visitors and across desktop vs mobile.",
    redFlags: "Treatment showed expected behavior (lower signup, lower conversion) consistent with removing the discount incentive. No SRM issues. No anomalous segment patterns.",
    goldStandard: {
      validity: "Statistically valid. Sample sizes adequate, p-values strong, confidence intervals tight. The negative effect is real and measurable across all primary metrics.",
      practical: "Practically significant in the wrong direction. A $0.36 revenue per session decline at this traffic volume translates to substantial revenue loss. Email signup dropping nearly 6pp eliminates a major top-of-funnel input.",
      segmentation: "No heterogeneous treatment effects — every segment performed worse with the order-tracking modal. This is consistent with the discount being the primary driver of value perception, not the modal copy itself.",
      threats: "No methodological threats identified. Test was clean. The hypothesis was simply wrong.",
      shipDecision: "Do not ship. The order-tracking modal underperforms the discount modal on every metric. The hypothesis (that order-tracking utility would replace discount appeal) is rejected. Consider a different test: a hybrid modal offering both (10% off + order tracking) to see if utility adds incremental value on top of the discount.",
    },
  },
  {
    id: "ab-retail-3", domain: "retail",
    hypothesis: "Adding social proof badges ('Bestseller', 'Trending Now') to product tiles will increase click-through rate from category pages.",
    setup: "Specialty retail, 30-day test on category pages. Treatment: top 25% of products by sales velocity show badges. Control: no badges.",
    metrics: {
      treatment: { users: 86200, ctr: "11.2%", purchase_conversion: "2.8%", revenue_per_user: "$4.20" },
      control:   { users: 85900, ctr: "9.8%", purchase_conversion: "2.4%", revenue_per_user: "$3.60" },
    },
    results: "CTR: +1.4pp (p<0.001). Purchase conversion: +0.4pp (p<0.001). Revenue per user: +$0.60 (p<0.001). Effect appeared to grow over the 30-day window — early results showed +0.8pp CTR, late results showed +1.8pp.",
    segments: "All segments showed positive effects. Effect was largest for users on first session (no prior history). Returning users with purchase history showed smaller (but still positive) effect.",
    redFlags: "Effect magnitude grew across the 30-day window from +0.8pp to +1.8pp. The badges were applied to top-velocity products, but velocity itself shifts as the badges drive more clicks (feedback loop).",
    goldStandard: {
      validity: "Statistically valid on the primary metrics. Sample sizes adequate. However, the growing effect over time is a methodological flag.",
      practical: "Practically significant lift across all primary metrics. CTR up 14% relative, revenue per user up 17%. These are meaningful gains.",
      segmentation: "The largest effect is on first-session users, which is consistent with social proof being most impactful when users have no other signal. Returning users have their own purchase history and rely less on badges. This is a reasonable and expected pattern.",
      threats: "The growing effect over time is the key threat. As badges drive more clicks to badged products, those products' velocity increases further, reinforcing the badge selection. This is a positive feedback loop, not a stable treatment effect. The 'real' steady-state lift may be lower than the late-test measurement suggests. Also: novelty effect could be inflating early clicks (users investigating something new in the UI).",
      shipDecision: "Ship, but recalibrate the velocity calculation to lag the test period (use velocity from 30 days BEFORE the test to assign badges, then re-evaluate after 60 days). Set guardrail metric: long-tail product visibility — if all clicks concentrate on the top 25%, the bottom 75% may suffer revenue declines that offset the headline lift.",
    },
  },

  // HEALTHCARE — 3 scenarios
  {
    id: "ab-hc-1", domain: "healthcare",
    hypothesis: "Sending appointment reminders 7 days before AND 24 hours before (vs 24 hours only) will reduce no-show rate for new-patient appointments.",
    setup: "Multi-specialty clinic, 60-day test on new-patient appointments booked 14+ days in advance. Treatment: 7-day + 24-hour reminders. Control: 24-hour only.",
    metrics: {
      treatment: { appointments: 4280, no_shows: "21.4%", on_time_arrival: "62.1%", reschedules_72hr: "8.2%" },
      control:   { appointments: 4310, no_shows: "27.8%", on_time_arrival: "58.4%", reschedules_72hr: "4.1%" },
    },
    results: "No-show rate: -6.4pp (p<0.001). On-time arrival: +3.7pp (p=0.02). Reschedule rate (72hr+ before appt): +4.1pp (p<0.001). Net appointment fill rate (no-show + last-minute cancel): -2.1pp (p=0.04).",
    segments: "Effect concentrated in patients booked 14-21 days in advance. Patients booked 22+ days in advance showed minimal effect. New patients showed larger effect than returning patients.",
    redFlags: "Reschedule rate increased significantly. Many of the 'saved' no-shows became reschedules — the slot is technically filled later but the original slot still went unused short-term.",
    goldStandard: {
      validity: "Statistically valid on the primary metric (no-show rate, p<0.001). Sample sizes adequate. Test duration appropriate for new-patient appointment cycle.",
      practical: "6.4pp reduction in no-show rate is meaningful — at typical new-patient appointment values ($240+), this represents significant recovered revenue. However, the 4.1pp increase in reschedules partially offsets the impact on appointment slot utilization.",
      segmentation: "The 14-21 day booking window shows the strongest effect, suggesting the 7-day reminder hits at the right cognitive distance. Patients booked further out may need different reminder cadence (perhaps 14-day + 7-day + 24-hour).",
      threats: "The reschedule increase is a real threat. The treatment may not be reducing no-shows as much as it's converting no-shows into earlier reschedules — same outcome for the original slot, just better-known to the schedulers. The TRUE metric is appointment slot utilization (was the original slot filled or not), which only improved 2.1pp net.",
      shipDecision: "Ship the 7-day reminder, but with awareness that the 'win' is smaller than the headline no-show number suggests. The real benefit is operational predictability (reschedules with notice are easier to fill than no-shows). Set guardrail metric: provider productivity — if reschedules cluster at undesirable times, provider utilization may suffer. Consider testing a same-day-fill list to capture released reschedule slots.",
    },
  },
  {
    id: "ab-hc-2", domain: "healthcare",
    hypothesis: "Redesigning the patient portal homepage to lead with 'View Test Results' (vs current 'Schedule Appointment') will increase test result viewing rate within 7 days of result posting.",
    setup: "Health system patient portal, 45-day test. Treatment: redesigned homepage. Control: existing homepage. Random assignment at user level.",
    metrics: {
      treatment: { users: 28400, results_viewed_7day: "62.4%", appointments_scheduled: "8.2%", portal_logins: "2.4 per user" },
      control:   { users: 28100, results_viewed_7day: "44.1%", appointments_scheduled: "11.8%", portal_logins: "1.9 per user" },
    },
    results: "Test results viewed within 7 days: +18.3pp (p<0.001). Appointments scheduled: -3.6pp (p<0.001). Portal logins: +0.5 per user (p<0.001).",
    segments: "Patients with recent (last 30 days) lab work showed largest results-viewing lift. Patients with chronic conditions showed appointment-scheduling decline more sharply than acute-care patients.",
    redFlags: "Appointment scheduling decreased significantly. Treatment may be solving one problem (results viewing) while creating another (appointment booking friction).",
    goldStandard: {
      validity: "Statistically valid on both primary metrics. Sample sizes adequate. The conflicting directions of the two metrics are real, not noise.",
      practical: "Practically significant in both directions. The +18.3pp results viewing lift is a major patient experience win. The -3.6pp appointment scheduling decline is a real revenue and care-coordination concern.",
      segmentation: "Chronic condition patients showing sharper appointment decline is concerning — this population needs regular follow-up scheduling, and any friction here has clinical implications, not just operational ones.",
      threats: "This is a textbook tradeoff: optimizing for one user task at the expense of another. The redesigned homepage promotes one action by demoting another. There's no methodological threat — the data is clean — but the decision needs to weigh patient experience (better results visibility) against operational and clinical needs (appointment scheduling for chronic patients).",
      shipDecision: "Do not ship as-is. The 3.6pp drop in appointment scheduling is a meaningful clinical and revenue concern, particularly concentrated in chronic patients. Iterate on the design: maintain the results-viewing prominence but add a persistent appointment-scheduling shortcut that doesn't require deeper navigation. Re-test the modified design. The hypothesis (that results visibility would improve) was correct; the implementation created an unintended consequence.",
    },
  },
  {
    id: "ab-hc-3", domain: "healthcare",
    hypothesis: "Replacing physician-led discharge education with a video-based discharge module will reduce 30-day readmission rate for CHF patients by improving education consistency.",
    setup: "Hospital cardiology unit, 90-day test. Treatment (n=420): video-based discharge education + nurse Q&A. Control (n=410): standard physician-led discharge. Patients randomized at admission.",
    metrics: {
      treatment: { patients: 420, readmit_30day: "16.2%", patient_satisfaction: "4.2/5", discharge_time: "28 min avg" },
      control:   { patients: 410, readmit_30day: "18.1%", patient_satisfaction: "4.4/5", discharge_time: "42 min avg" },
    },
    results: "30-day readmission: -1.9pp (p=0.34, not significant). Patient satisfaction: -0.2 (p=0.08). Discharge time: -14 minutes (p<0.001).",
    segments: "English-speaking patients showed -3.4pp readmit reduction (closer to significance). Spanish-speaking patients showed +2.1pp readmit increase (not significant individually due to smaller sample). Patients 65+ showed worse outcomes than patients under 65.",
    redFlags: "Sample size of 830 patients is small for detecting modest readmit rate differences. The Spanish-speaking patient subgroup may have been disadvantaged by video module language coverage. Patients 65+ comprise the bulk of CHF cases.",
    goldStandard: {
      validity: "Not statistically valid on the primary metric (readmit rate, p=0.34). Sample size is underpowered to detect a 2pp difference in readmit rate — would need ~3,000 patients per arm for adequate power. The discharge time finding is statistically valid but secondary.",
      practical: "The 1.9pp readmit reduction would be practically meaningful IF it were real. With p=0.34 and small sample, we cannot conclude this is anything but noise. The 14-minute discharge time saving is operationally meaningful but not the primary outcome.",
      segmentation: "The Spanish-speaking subgroup pattern is a serious equity concern. Even though individually not significant, the directional difference (treatment worse for Spanish-speaking, better for English-speaking) suggests the video module may have language coverage or cultural appropriateness issues. The 65+ population showing worse outcomes is also concerning since they're the primary CHF population.",
      threats: "Underpowered study (small sample, large variance in readmit rates). Heterogeneous treatment effects suggest the intervention works for some populations and may harm others. Patient satisfaction directionally lower in treatment, suggesting discharged patients felt less supported.",
      shipDecision: "Do not ship. The primary endpoint did not meet statistical significance, and concerning subgroup patterns (Spanish-speaking, 65+) suggest the intervention may not be safe for the broader CHF population. Iterate: improve language coverage of video module, then re-test with larger sample size powered to detect a 2pp readmit rate difference (~3,000 patients per arm). The 14-minute discharge time saving is real but does not justify the equity risk.",
    },
  },

  // FINANCE — 3 scenarios
  {
    id: "ab-fin-1", domain: "finance",
    hypothesis: "Simplifying the credit card application form from 14 fields to 8 fields (with optional fields hidden behind 'Show more') will increase completion rate without harming approval rate.",
    setup: "Credit card issuer, 30-day test on the online application page. Treatment: 8-field form. Control: 14-field form. New applicants only.",
    metrics: {
      treatment: { applicants: 24800, completion: "61.2%", approved: "32.4%", first_3mo_default: "1.8%" },
      control:   { applicants: 24600, completion: "48.4%", approved: "34.1%", first_3mo_default: "1.4%" },
    },
    results: "Completion rate: +12.8pp (p<0.001). Approval rate among completers: -1.7pp (p=0.02). First-90-day default rate: +0.4pp (p=0.04).",
    segments: "Completion lift was consistent across all credit score bands. Default rate increase was concentrated in the 580-650 credit score band (+1.8pp default vs +0.1pp default in 750+ score band).",
    redFlags: "First-90-day default rate is a leading indicator of long-term default. The 0.4pp increase is small in absolute terms but represents 28% relative increase. The simplified form may be capturing applicants who provided less reliable self-reported data, hurting approval model accuracy.",
    goldStandard: {
      validity: "Statistically valid on all three metrics. Sample sizes adequate. Test duration appropriate for completion and short-term default measurement.",
      practical: "Completion lift is practically significant — 12.8pp more completed applications represents substantial top-of-funnel growth. However, the default rate increase is also practically significant: a 28% relative increase in early defaults at credit card scale translates to material loss provisions.",
      segmentation: "The default rate concentration in the 580-650 credit band is the critical finding. Removing fields means the underwriting model has less data to make accurate decisions, and the impact is largest where the model is most marginal — the subprime band. Higher credit scores are robust to less data; lower scores are not.",
      threats: "The 90-day default rate is a leading indicator only. The TRUE 18-24 month default rate is what matters for unit economics, and 30-day data is too early to know that. Unit economics impact of the trade (more applications × lower-quality applications) needs full lifecycle modeling.",
      shipDecision: "Do not ship without modification. Net unit economics are likely negative once full default cycle plays out — the 28% relative default increase, even if only 0.4pp absolute, will erode the gains from higher completion. Iterate: simplify the form for prime applicants (700+ credit score) but maintain the 14-field form for subprime applicants where the model needs more data. Re-test segmented form with proper unit economics modeling.",
    },
  },
  {
    id: "ab-fin-2", domain: "finance",
    hypothesis: "Adding a 'Round up to the nearest dollar' savings option at checkout will increase the percentage of customers who enable automatic savings.",
    setup: "Mobile banking app, 21-day test on checkout flow. Treatment: round-up option visible at every transaction. Control: existing flow without round-up.",
    metrics: {
      treatment: { users: 84200, savings_enrollment: "12.4%", checkout_completion: "94.1%", session_length: "3.2 min" },
      control:   { users: 83800, savings_enrollment: "3.2%", checkout_completion: "94.8%", session_length: "2.9 min" },
    },
    results: "Savings enrollment: +9.2pp (p<0.001). Checkout completion: -0.7pp (p=0.04). Session length: +0.3 min (p<0.001).",
    segments: "Largest enrollment increase among users 25-34. Users 55+ showed lower enrollment lift but higher checkout completion impact (-1.4pp). Users with existing automatic savings showed no effect (already opted in).",
    redFlags: "Checkout completion declined slightly, particularly among older users. Some users may be confused or distracted by the new option, leading to abandoned transactions. Session length increase suggests added friction.",
    goldStandard: {
      validity: "Statistically valid on all metrics. Sample sizes adequate. Checkout completion decline is small but real (p=0.04, tight CI).",
      practical: "Savings enrollment lift is dramatic (+287% relative) — this is a meaningful behavior change at scale. The 0.7pp checkout completion decline is small but at high transaction volume represents real lost revenue.",
      segmentation: "Users 55+ showing higher checkout abandonment is a usability concern. The intervention is working as intended for younger users (savings enrollment) but creating friction for older users (checkout completion).",
      threats: "Long-term retention of round-up enrollment is unknown — users who enable on impulse may disable when they see savings accumulate slowly. Default behavior may decay. Also: are users actually saving more, or just routing money differently? Need to validate that round-up savings is incremental savings, not displacing other savings behaviors.",
      shipDecision: "Ship with a UX iteration: make the round-up option more dismissible for users who don't want it, particularly on mobile (where the friction was largest). The savings enrollment gain dramatically outweighs the checkout completion loss in user-value terms. Set guardrail metrics: 90-day round-up enrollment retention rate (target 60%+), and incremental total savings per enrolled user (verify this is new savings, not displaced).",
    },
  },
  {
    id: "ab-fin-3", domain: "finance",
    hypothesis: "Adding personalized financial insights ('You spent 23% more on dining this month than last month') to the account dashboard will increase weekly active user rate.",
    setup: "Personal finance app, 60-day test. Treatment: 3-5 personalized insights on dashboard, refreshed weekly. Control: existing dashboard.",
    metrics: {
      treatment: { users: 42100, weekly_active: "58.4%", session_frequency: "4.2 per week", subscription_churn: "2.4%/mo" },
      control:   { users: 41800, weekly_active: "44.2%", session_frequency: "3.1 per week", subscription_churn: "3.1%/mo" },
    },
    results: "Weekly active rate: +14.2pp (p<0.001). Session frequency: +1.1 per week (p<0.001). Monthly subscription churn: -0.7pp (p=0.02). Effect was strongest in weeks 1-3, declined in weeks 4-8 but stayed positive.",
    segments: "Power users (top 20% by historical engagement) showed largest absolute lift. New users (under 30 days tenure) showed modest lift but had lower baseline. Users with under 3 connected accounts showed almost no effect (insights were thin).",
    redFlags: "Effect declining over time is consistent with novelty effect — the 'wow' of new insights wears off as users see similar patterns repeatedly. The week 1-3 vs week 4-8 gap suggests steady-state effect may be smaller than the headline.",
    goldStandard: {
      validity: "Statistically valid on all metrics. The 60-day duration is sufficient to begin assessing novelty decay. Sample sizes adequate.",
      practical: "Practically significant on every metric. Even if the steady-state effect is half the headline, +7pp WAU and -0.35pp churn are meaningful for a personal finance app where engagement drives retention drives revenue.",
      segmentation: "The thin-data segment (under 3 accounts) is a clear UX issue — insights need data to be insightful. Power user lift is expected (they engage more, get more insights). New user effect is muted because they don't have spending history to compare against. The product needs different mechanics for users with less data history.",
      threats: "Novelty effect is the primary threat. Week 4-8 effect was smaller than week 1-3, and the trend may continue. A 90-day or 180-day re-measurement is needed to find steady-state effect. Also: insights are based on month-over-month comparisons — what happens in months where spending is unusually flat (no insights to surface)?",
      shipDecision: "Ship with two modifications: (1) gracefully handle low-data users by showing different content or onboarding-style guidance, and (2) commit to a 90-day post-launch re-measurement to confirm steady-state lift. The headline gains are large enough that even a 50% novelty discount still leaves practical significance. Set guardrail metric: insight relevance feedback (in-app rating per insight) to detect when insight quality decays.",
    },
  },

  // OPERATIONS / SUPPLY CHAIN — 3 scenarios
  {
    id: "ab-ops-1", domain: "operations",
    hypothesis: "Switching from time-based to volume-based dispatch routing for last-mile delivery drivers will reduce average delivery time per stop.",
    setup: "Last-mile delivery network, 30-day test in 4 metro markets. Treatment: routes optimized for volume density. Control: existing time-windowed routes. Randomization at driver-day level.",
    metrics: {
      treatment: { driver_days: 1840, avg_stops_per_route: "62.4", delivery_time_per_stop: "8.2 min", on_time_delivery: "88.4%", driver_overtime: "6.2%" },
      control:   { driver_days: 1820, avg_stops_per_route: "58.1", delivery_time_per_stop: "9.8 min", on_time_delivery: "91.2%", driver_overtime: "4.1%" },
    },
    results: "Stops per route: +4.3 (p<0.001). Delivery time per stop: -1.6 min (p<0.001). On-time delivery: -2.8pp (p=0.02). Driver overtime: +2.1pp (p<0.001).",
    segments: "Suburban routes showed largest improvement in stops per route. Urban routes showed degraded on-time delivery (-5.4pp). Rural routes showed mixed results.",
    redFlags: "On-time delivery decline is concerning — the routing optimization may be packing routes too densely, causing late deliveries when any disruption occurs. Driver overtime increased.",
    goldStandard: {
      validity: "Statistically valid on all primary metrics. Sample sizes (driver-days) adequate for the test duration.",
      practical: "Stops per route up 7.4% relative is operationally significant. Delivery time per stop down 16% is also meaningful. However, the on-time delivery decline (-2.8pp) and driver overtime increase (+2.1pp) are real costs that offset the efficiency gains.",
      segmentation: "Urban route degradation is the critical finding. The volume-based routing assumes consistent stop times, but urban routes have higher variance (traffic, parking, building access) that breaks the optimization. The intervention works for suburban density but fails in urban complexity.",
      threats: "Test duration of 30 days may not capture seasonal effects (weather, traffic patterns). Driver fatigue from overtime is a leading indicator of safety incidents and turnover that won't show in 30 days. Customer complaints about late deliveries may show up later in NPS or churn.",
      shipDecision: "Ship for suburban and rural routes only. Do not ship for urban routes — the on-time delivery decline and overtime cost likely exceed the efficiency gains there. For urban routes, develop a hybrid model that incorporates traffic variance and stop-time uncertainty into the routing algorithm. Set guardrail metrics: customer complaints, driver turnover, and safety incident rate (90-day post-launch).",
    },
  },
  {
    id: "ab-ops-2", domain: "operations",
    hypothesis: "Adding a 'Express Pickup' option for high-frequency wholesale customers will reduce loading dock wait time and increase wholesale order frequency.",
    setup: "Distribution center serving wholesale customers, 60-day test. Treatment: top 20% of wholesale customers by order frequency get Express Pickup lane access. Control: standard pickup process.",
    metrics: {
      treatment: { customers: 142, avg_wait_time: "18 min", weekly_orders: "3.4", on_time_pickup: "94.2%", customer_satisfaction: "4.6/5" },
      control:   { customers: 138, avg_wait_time: "47 min", weekly_orders: "2.8", on_time_pickup: "82.1%", customer_satisfaction: "4.1/5" },
    },
    results: "Wait time: -29 min (p<0.001). Weekly orders: +0.6 (p<0.001). On-time pickup: +12.1pp (p<0.001). Customer satisfaction: +0.5 (p<0.001).",
    segments: "All segments showed positive effects. Largest absolute improvement among customers placing 5+ orders/week. Smallest absolute improvement among customers placing 1-2 orders/week (smaller baseline volume).",
    redFlags: "What about the impact on customers NOT in the Express Pickup tier? The control group's wait time was 47 minutes — much higher than the treatment's 18 minutes — suggesting non-tier customers may experience longer waits when Express Pickup customers bypass the queue.",
    goldStandard: {
      validity: "Statistically valid on the treatment group's primary metrics. However, the test design did not measure the spillover effect on the non-Express Pickup customer base, which is a critical gap.",
      practical: "Practically significant gains for the treatment group. 29-minute wait time reduction is operationally meaningful. 0.6 additional orders per week per customer translates to 21% volume increase from this segment.",
      segmentation: "The fact that all treatment segments benefited is good. But the more important segmentation question is the population NOT included in the test — the bottom 80% of wholesale customers who may be experiencing degraded service.",
      threats: "Major threat: this is a queue-jumping intervention, and the win for treatment customers may come at the cost of control customers. The control group wait time of 47 minutes (vs treatment's 18 minutes) hints at this — but the test wasn't designed to measure it. Need to compare control group wait time pre-test vs during-test to see if it degraded.",
      shipDecision: "Ship pending one validation: pull pre-test data on average wait time for the bottom 80% of customers and compare to during-test data. If their wait times degraded materially (more than 10 minutes), the gain for top customers is partly extracted from the rest. Mitigate by: (1) capping Express Pickup capacity so it doesn't fully consume dock resources, or (2) tiering benefits more granularly. Set guardrail metric: total dock throughput (sum across all customers) — must not decline.",
    },
  },
  {
    id: "ab-ops-3", domain: "operations",
    hypothesis: "Replacing paper-based picking lists with handheld scanner-guided picking will reduce picking errors and increase units-per-labor-hour.",
    setup: "DTC fulfillment center, 45-day test. Treatment: handheld scanners for selected pickers (n=42). Control: paper picking lists (n=44). Pickers randomized at start of test.",
    metrics: {
      treatment: { pickers: 42, units_per_hour: "112", pick_accuracy: "99.6%", training_completion: "98%", picker_satisfaction: "3.8/5" },
      control:   { pickers: 44, units_per_hour: "98", pick_accuracy: "99.1%", training_completion: "100%", picker_satisfaction: "4.2/5" },
    },
    results: "Units per hour: +14 (p<0.001). Pick accuracy: +0.5pp (p=0.04). Training completion: -2pp (p=0.18). Picker satisfaction: -0.4 (p=0.01).",
    segments: "Experienced pickers (180+ days tenure) showed largest productivity lift. New pickers (under 30 days tenure) showed minimal improvement and lowest satisfaction with handheld system.",
    redFlags: "Picker satisfaction declined significantly with handheld scanners. New pickers struggled with the technology. Two pickers in the treatment group dropped out of the test mid-way (data excluded but pattern noted).",
    goldStandard: {
      validity: "Statistically valid on the productivity and accuracy metrics. Sample size (86 pickers) is adequate for individual-level metrics. Drop-out of two treatment pickers is a methodological concern — were they removed for performance or did they refuse the technology?",
      practical: "14% productivity lift is operationally significant — at fulfillment center scale this translates to meaningful labor cost savings. 0.5pp accuracy improvement is practically meaningful given the cost of pick errors (returns, customer complaints).",
      segmentation: "New picker satisfaction and productivity gap is concerning. The technology has a learning curve that may extend beyond the 45-day test window. Long-term productivity depends on both experienced pickers (who benefit) and new pickers (who currently struggle).",
      threats: "Picker satisfaction decline could lead to higher turnover. Turnover at fulfillment centers is already high — making the job worse for pickers may have downstream cost (retraining, productivity ramp time). The two drop-outs are a signal that warrants investigation.",
      shipDecision: "Ship with a phased rollout: experienced pickers first, then new pickers after 60-day training program designed for the handheld system. Address picker satisfaction directly — ergonomics, training quality, and the option to switch back to paper for difficult orders. Set guardrail metrics: picker turnover rate (90-day post-launch), and average time-to-productivity for new pickers (must not increase significantly).",
    },
  },

  // MARKETING — 3 scenarios
  {
    id: "ab-mkt-1", domain: "marketing",
    hypothesis: "Subject lines that include the recipient's first name will increase email open rate compared to subject lines without personalization.",
    setup: "DTC retailer, 14-day test on weekly newsletter. Treatment: 'Sarah, your weekly drop is here'. Control: 'Your weekly drop is here'. Random A/B at send.",
    metrics: {
      treatment: { sent: 482000, open_rate: "24.1%", click_rate: "3.2%", unsubscribe_rate: "0.18%", revenue_per_send: "$0.42" },
      control:   { sent: 481000, open_rate: "23.4%", click_rate: "3.1%", unsubscribe_rate: "0.14%", revenue_per_send: "$0.41" },
    },
    results: "Open rate: +0.7pp (p=0.04). Click rate: +0.1pp (p=0.62). Unsubscribe rate: +0.04pp (p=0.03). Revenue per send: +$0.01 (p=0.71).",
    segments: "Newer subscribers (under 90 days) showed +1.4pp open rate lift. Long-tenured subscribers (1+ year) showed -0.2pp open rate (slightly negative). Effect was negligible across all click and revenue metrics.",
    redFlags: "Statistically significant on open rate but the magnitude is tiny. Unsubscribe rate increased (also significant). Effect on click rate and revenue is essentially zero.",
    goldStandard: {
      validity: "Statistically valid on open rate and unsubscribe rate (the two significant findings). Click rate and revenue per send are not significantly different. With sample sizes this large, even tiny differences become statistically significant — this is the classic case where statistical significance does not imply practical significance.",
      practical: "Open rate lift is so small (+0.7pp on a 23.4% baseline = +3% relative) and revenue per send is essentially flat. The unsubscribe rate increase, while small, is concerning for long-term list health. Personalization is widely overestimated as a lift driver.",
      segmentation: "The segment story is more interesting than the headline: new subscribers like personalization, long-tenured subscribers slightly dislike it. This pattern suggests personalization feels intrusive when the subscriber-brand relationship has been impersonal — a 'you don't know me, why are you using my name' reaction.",
      threats: "Apple Mail Privacy Protection inflates open rate measurement. Some 'opens' may be automated proxy fetches that don't reflect actual engagement. Click rate is more honest, and click rate didn't move at all.",
      shipDecision: "Do not ship as universal treatment. The lift on open rate is small, doesn't translate to revenue, and increases unsubscribes. Consider segment-specific use: personalization for new subscribers (under 90 days) where it shows real lift, but no personalization for long-tenured subscribers where it backfires. Re-test the segmented approach. Don't repeat the marketing-industry mistake of treating personalization as universally good.",
    },
  },
  {
    id: "ab-mkt-2", domain: "marketing",
    hypothesis: "Replacing the homepage hero image (model wearing product) with a customer testimonial video (real customer reviewing product) will increase conversion rate.",
    setup: "DTC beauty brand, 30-day test on homepage. Treatment: 30-second customer testimonial video. Control: existing static hero image. New visitors only.",
    metrics: {
      treatment: { visitors: 184200, conversion: "1.4%", avg_session_duration: "3.4 min", scroll_depth: "62%", revenue_per_visitor: "$0.84" },
      control:   { visitors: 183800, conversion: "1.7%", avg_session_duration: "2.8 min", scroll_depth: "48%", revenue_per_visitor: "$1.02" },
    },
    results: "Conversion: -0.3pp (p<0.001). Session duration: +0.6 min (p<0.001). Scroll depth: +14pp (p<0.001). Revenue per visitor: -$0.18 (p<0.001).",
    segments: "Mobile users showed largest conversion decline (-0.5pp). Desktop users showed smaller decline (-0.1pp, p=0.18). New visitors showed worse performance than returning visitors.",
    redFlags: "Treatment shows higher engagement (longer session, deeper scroll) but lower conversion and revenue. Users are watching the video but not buying. Mobile decline is sharpest — possibly because the video plays poorly on mobile or is too long for mobile attention.",
    goldStandard: {
      validity: "Statistically valid on all primary metrics. Sample sizes large. Test duration adequate. The directional finding (more engagement, less conversion) is real.",
      practical: "Practically significant in the wrong direction. -$0.18 revenue per visitor at this traffic translates to substantial revenue loss over time. The hypothesis (testimonial video would convert better) is rejected.",
      segmentation: "The mobile/desktop gap is informative. Video content on mobile homepage is frequently a conversion killer due to bandwidth, autoplay restrictions, and attention dynamics. The treatment may work fine on desktop but cannot survive mobile traffic share.",
      threats: "The 'higher engagement, lower conversion' pattern is a classic distraction. Users are spending more time on the page (watching the video) but the video doesn't drive purchase intent — it satisfies curiosity instead. This is a meaningful pattern beyond this single test: engagement metrics can move in the wrong direction relative to revenue.",
      shipDecision: "Do not ship. Iterate: try the testimonial video as a secondary element (lower on the page) rather than as the hero, so users see the product first and the testimonial as supporting content. Alternatively, test a shorter (10-15 second) testimonial video specifically for mobile. Re-test before deploying.",
    },
  },
  {
    id: "ab-mkt-3", domain: "marketing",
    hypothesis: "Showing 3 ad creative variants in rotation (vs the single best-performing creative) will reduce ad fatigue and improve sustained ROAS over a 60-day campaign window.",
    setup: "DTC apparel brand, 60-day test on Facebook ads. Treatment: 3 creative variants rotated weekly. Control: single best-performing creative used throughout. Same audience targeting and budget.",
    metrics: {
      treatment: { impressions: 4200000, ctr: "1.8%", cpa: "$28", roas: "2.4x", frequency_avg: "4.8" },
      control:   { impressions: 4180000, ctr: "2.1%", cpa: "$24", roas: "2.8x", frequency_avg: "5.2" },
    },
    results: "CTR: -0.3pp (p<0.001). CPA: +$4 (p<0.001). ROAS: -0.4x (p<0.001). Frequency: -0.4 per user (p=0.02). Effect was inverted in the first 14 days (treatment performed better) and reversed in days 14-60.",
    segments: "Audiences with high overlap (existing customers) showed treatment performing worse throughout. Cold audiences showed treatment performing better in early period, then converging to control.",
    redFlags: "The inverted effect over time is the key finding. Treatment was winning in the first 14 days but lost ground over the next 46 days. The control creative may have been chosen because it was already optimized — the rotation diluted that performance.",
    goldStandard: {
      validity: "Statistically valid on the aggregate metrics over the full 60 days. The temporal pattern (early treatment win, late treatment loss) is also real and important — though it inverts the headline conclusion if you only looked at early data.",
      practical: "Practically significant in the wrong direction. -0.4x ROAS is a meaningful campaign performance loss. The hypothesis (rotation reduces fatigue) was directionally wrong for this campaign.",
      segmentation: "Existing customers (high overlap) showed worse rotation performance throughout — they're already familiar with the brand and the rotation didn't add fresh interest. Cold audiences showed early lift that decayed. The story is: rotation helps with novelty for unfamiliar audiences but doesn't beat a strong winner over time.",
      threats: "The 14-day inversion point is a serious threat to the hypothesis. If you ran this test for 14 days, you'd ship the rotation and lose ROAS for the remaining 46 days. This is why long-running tests matter for ad campaigns. Also: 'frequency' decreased in treatment, which could mean rotation is showing fewer impressions per user — so users may not be hitting the threshold needed to convert.",
      shipDecision: "Do not ship rotation as universal strategy. The single best creative outperformed rotation over a 60-day window. However, consider: (1) using rotation for cold audience acquisition specifically (where early-period lift was real), and (2) refreshing the single best creative every 30-45 days rather than rotating. The deeper insight: a strong creative is more valuable than rotation; the right play is finding new strong creatives, not diluting strong creatives.",
    },
  },

  // PRODUCT ANALYTICS — 5 scenarios
  {
    id: "ab-prod-1", domain: "product",
    hypothesis: "Adding a one-tap 'Continue with Google' option to the signup screen will reduce drop-off in the signup funnel and increase D7 retention.",
    setup: "Mobile app signup, 30-day test. Treatment: Google SSO button + email signup option. Control: email signup only.",
    metrics: {
      treatment: { signup_starts: 84200, signup_completion: "72.4%", d1_retention: "48.2%", d7_retention: "31.4%", account_quality_score: "0.68" },
      control:   { signup_starts: 83800, signup_completion: "58.1%", d1_retention: "52.4%", d7_retention: "34.2%", account_quality_score: "0.74" },
    },
    results: "Signup completion: +14.3pp (p<0.001). D1 retention: -4.2pp (p<0.001). D7 retention: -2.8pp (p<0.001). Account quality score (composite of profile completion, friend connections, content engagement): -0.06 (p<0.001).",
    segments: "All segments showed signup completion lift. D7 retention decline was concentrated in users who came from paid ad channels. Organic signups showed no significant retention difference.",
    redFlags: "Signup completion went up dramatically but the resulting users retain worse and have lower 'quality scores'. Treatment may be importing lower-intent users who would have abandoned at email signup but now coast through SSO without genuine interest.",
    goldStandard: {
      validity: "Statistically valid on all metrics. Sample sizes large enough to detect meaningful differences. The 30-day window is adequate for D7 retention measurement.",
      practical: "Practically significant on signup completion (+24% relative) — a major top-of-funnel improvement. But also practically significant on retention degradation. The trade has to be evaluated on lifetime user value, not signup count.",
      segmentation: "The paid-channel concentration of retention decline is the key finding. Paid users were already lower-intent than organic users; SSO removes the only friction that filtered out the very lowest-intent paid users. Organic users with genuine interest don't need that filter.",
      threats: "Signup completion is a vanity metric in isolation. The right metric is qualified active users 30 days out, not raw signups. The account quality score decline is a leading indicator that these users will not produce normal user economics. Also: 4.2pp D1 retention drop is a sharp signal — these users are bouncing on first session.",
      shipDecision: "Ship for organic acquisition channels only. For paid channels, either: (1) maintain email-only signup to filter intent, or (2) ship Google SSO but add a low-friction qualification step (e.g., 'What brings you here today?') that filters out drive-by signups. Set guardrail metric: 30-day qualified active users (not just signups). The practical lift is meaningless if the new signups don't become users.",
    },
  },
  {
    id: "ab-prod-2", domain: "product",
    hypothesis: "Replacing chronological feed with algorithmic 'For You' ranking will increase session length and DAU.",
    setup: "Social content app, 45-day test. Treatment: ML-ranked feed showing posts ordered by predicted engagement. Control: chronological feed (newest posts first).",
    metrics: {
      treatment: { users: 142000, dau_mau_ratio: "42%", session_length: "12.4 min", session_frequency: "3.8/day", creator_post_rate: "8.2%" },
      control:   { users: 141000, dau_mau_ratio: "38%", session_length: "8.6 min", session_frequency: "3.2/day", creator_post_rate: "11.4%" },
    },
    results: "DAU/MAU ratio: +4pp (p<0.001). Session length: +3.8 min (p<0.001). Session frequency: +0.6/day (p<0.001). Creator post rate: -3.2pp (p<0.001).",
    segments: "Consumer (non-posting) users showed strong positive effects across all metrics. Creator users (top 10% by historical posts) showed reduced post frequency. Smallest creators (1-5 posts/month) had the sharpest decline (-5.4pp).",
    redFlags: "Consumer engagement up significantly. Creator behavior down significantly. This is the classic 'algorithmic feed kills creator economy' pattern — when posts compete for algorithmic ranking instead of being seen by followers, smaller creators feel less rewarded for posting.",
    goldStandard: {
      validity: "Statistically valid on all primary metrics. Sample sizes very large. The bidirectional finding (consumer up, creator down) is real and important.",
      practical: "Practically significant on both sides. +4pp DAU/MAU and +3.8 min session length are major engagement gains. -3.2pp creator post rate is also major — reducing supply of new content has compounding effects on long-term platform health.",
      segmentation: "Smallest creators (1-5 posts/month) being most affected is critical. These creators are the platform's growth engine — converting consumers to creators. Discouraging them from posting damages the creator pipeline. Top creators are buffered (they're already posting reliably) but the entry point to creation has gotten harder.",
      threats: "This is a classic two-sided platform tradeoff. Short-term consumer engagement metrics improve at the cost of long-term content supply. If creator post rate decline continues, content becomes thin in 6-12 months and consumer engagement will revert. The 45-day test cannot capture this dynamic — content supply effects play out over months.",
      shipDecision: "Ship the algorithmic feed but with a creator-protection mechanic: ensure new posts from a user's followers are prioritized (not just algorithmic 'For You'), so creators still feel rewarded by reaching their existing audience. Re-test the modified algorithm. Set long-term guardrail metrics: creator post rate trend (must not decline beyond 1pp), small-creator activation rate (consumers who become creators), and content supply diversity (top X% of creators contributing what fraction of content).",
    },
  },
  {
    id: "ab-prod-3", domain: "product",
    hypothesis: "Sending push notifications at the user's individual 'optimal time' (based on historical engagement) will increase notification CTR vs. a single fixed-time daily send.",
    setup: "Mobile productivity app, 21-day test. Treatment: ML-determined per-user optimal send time. Control: single fixed time (8 AM local). Same notification content and frequency.",
    metrics: {
      treatment: { users: 84000, push_ctr: "8.4%", session_post_push: "62.1%", notification_optout: "2.4%/mo", overall_dau: "+0.8% absolute" },
      control:   { users: 83800, push_ctr: "5.8%", session_post_push: "52.4%", notification_optout: "3.1%/mo", overall_dau: "Baseline" },
    },
    results: "Push CTR: +2.6pp (p<0.001). Session-after-push rate: +9.7pp (p<0.001). Monthly opt-out rate: -0.7pp (p<0.001). Overall DAU: +0.8% absolute (p<0.001).",
    segments: "All segments showed positive effects. Largest CTR lift among users with irregular engagement patterns (where optimal time differs most from 8 AM). Smallest effect among users who already engage at 7-9 AM (their optimal time was close to control).",
    redFlags: "Treatment is using historical engagement to predict optimal times, which creates a feedback loop: users who engaged in the past at certain times will continue to be sent notifications at those times. The model may be reinforcing existing patterns rather than capturing 'true' optimal times.",
    goldStandard: {
      validity: "Statistically valid across all primary metrics. Sample sizes adequate. 21-day test duration is appropriate for notification engagement metrics. CTR lift is large and consistent.",
      practical: "Practically significant gains across the board. CTR up 45% relative, opt-out rate down 23% relative, and overall DAU up 0.8% absolute (a meaningful win at scale). This is one of the most clearly positive results in the test set.",
      segmentation: "All segments benefit. The mechanism is clear: users with engagement patterns far from the 8 AM control time benefit most from personalization. Users already aligned to the control time benefit less but are not harmed.",
      threats: "Self-reinforcing prediction is a real but not disqualifying threat — the model captures real preferences and acting on them is value-creating. A more meaningful threat: what about new users with no historical engagement data? The test focused on existing users; cold-start performance for new users is unknown. Also: opt-out rate decline may be temporary; users may simply not yet have noticed the notifications.",
      shipDecision: "Ship for users with sufficient engagement history (e.g., 30+ days). For new users, default to 8 AM control time with switch-over after 30 days of data. Set guardrail metrics: cold-start (new user) notification engagement rate, and 90-day opt-out trend (verify the decline is durable, not just early-period).",
    },
  },
  {
    id: "ab-prod-4", domain: "product",
    hypothesis: "Reducing onboarding from 7 steps to 3 steps will increase activation rate (defined as completing first core action) without harming user quality.",
    setup: "B2B SaaS product, 30-day test on new signups. Treatment: 3-step onboarding (essential fields only). Control: 7-step onboarding (full profile, integrations, preferences).",
    metrics: {
      treatment: { signups: 8400, activation_d1: "62.4%", activation_d7: "74.1%", retention_d30: "44.2%", paid_conversion_d30: "8.1%" },
      control:   { signups: 8200, activation_d1: "48.2%", activation_d7: "61.4%", retention_d30: "42.4%", paid_conversion_d30: "10.4%" },
    },
    results: "D1 activation: +14.2pp (p<0.001). D7 activation: +12.7pp (p<0.001). D30 retention: +1.8pp (p=0.04). D30 paid conversion: -2.3pp (p<0.001).",
    segments: "Self-serve signups showed largest activation lift but smallest paid conversion. Sales-assisted signups showed moderate lift. Enterprise prospect signups showed paid conversion decline most sharply (-3.4pp).",
    redFlags: "Activation went up dramatically but paid conversion declined. The shorter onboarding may be activating more users but the users who complete the longer onboarding are higher-intent and more likely to pay.",
    goldStandard: {
      validity: "Statistically valid on activation and paid conversion (p<0.001 on both). D30 retention is borderline significant. Sample sizes adequate. The directional pattern (activation up, paid conversion down) is real.",
      practical: "Practically significant on both sides. +14pp D1 activation is a major top-of-funnel improvement. -2.3pp paid conversion is also major — at SaaS unit economics, paid conversion drives the entire business model. The trade has to be evaluated on revenue per signup, not activation rate alone.",
      segmentation: "Enterprise signup decline is the key finding. The longer onboarding wasn't just 'friction' — it was qualification. Enterprise prospects who complete a 7-step onboarding are signaling readiness and intent. Removing the steps removes the signal AND the qualification, importing more low-intent enterprise leads who don't convert.",
      threats: "Revenue per signup is the right metric, not activation. Calculation: control had 8200 × 10.4% = 853 paid conversions; treatment had 8400 × 8.1% = 680 paid conversions. Despite higher activation, treatment produced 173 fewer paid customers — a clear revenue loss.",
      shipDecision: "Do not ship as universal change. The activation gain doesn't translate to paid conversion gain — it's the opposite. Iterate: maintain 7-step onboarding for enterprise prospects (where qualification matters), use 3-step onboarding for self-serve / SMB prospects (where activation speed matters more than qualification). Re-test the segmented onboarding. Set primary metric: paid conversions per signup, not activation rate.",
    },
  },
  {
    id: "ab-prod-5", domain: "product",
    hypothesis: "Showing users a weekly summary of their app usage statistics ('You used Focus mode 14 times this week — top 10% of users') will increase D30 retention through engagement gamification.",
    setup: "Productivity mobile app, 60-day test. Treatment: weekly usage summary email + in-app notification. Control: no summary. Random assignment at user level.",
    metrics: {
      treatment: { users: 42000, d30_retention: "62.4%", session_frequency: "4.2/week", session_length: "8.4 min", subscription_renewal: "84.2%" },
      control:   { users: 41800, d30_retention: "58.1%", session_frequency: "3.8/week", session_length: "7.2 min", subscription_renewal: "81.4%" },
    },
    results: "D30 retention: +4.3pp (p<0.001). Session frequency: +0.4/week (p<0.001). Session length: +1.2 min (p<0.001). Subscription renewal: +2.8pp (p=0.003).",
    segments: "Power users (top 20% by historical engagement) showed largest lift across all metrics. Casual users showed smallest lift, especially on subscription renewal. Users in 'top 10%' rankings showed dramatically higher renewal rates than users in lower percentile rankings.",
    redFlags: "The summary email shows users their percentile ranking. Users in the top 10% are told they're top 10%. This may create a self-fulfilling positive feedback loop where 'winners' feel rewarded and stay, while 'losers' (lower percentiles) feel discouraged. Are the bottom-percentile users actually retaining better, or did the test miss measuring whether this messaging hurt them?",
    goldStandard: {
      validity: "Statistically valid on all primary metrics. Sample sizes adequate. 60-day test captures sufficient time to measure D30 retention and renewal cycle effects.",
      practical: "Practically significant gains. +4.3pp D30 retention and +2.8pp subscription renewal are meaningful for a subscription product. At scale, these gains compound substantially.",
      segmentation: "The power user concentration of effects is informative. Showing top users they're top creates engagement; showing bottom users they're bottom may demotivate. The current test doesn't break out the bottom-percentile user retention separately — it should, because the bottom 50% of users are who you most need to retain (the top 20% retains regardless).",
      threats: "Two threats: (1) selection bias — users who open the email are more engaged baseline, and the email may be measuring engagement effects rather than causing them. (2) bottom-percentile messaging effect — the percentile framing could harm users in the lower half of usage distribution. The aggregate metrics may be hiding harmful effects on a subgroup.",
      shipDecision: "Ship with one modification: do NOT show percentile ranking to users in the bottom 50% of usage distribution. For those users, show absolute usage with positive framing ('You used Focus mode 4 times this week — keep going!') instead of comparative ranking. Re-measure after 30 days to confirm bottom-half retention is preserved or improved. Set guardrail metric: bottom-half D30 retention rate (must not decline relative to control).",
    },
  },
];

// ── A/B TEST MODE COMPONENT ────────────────────────────────────────────────

function ABTestMode({ apiKey, progress, onScore }) {
  const [activeDomain, setActiveDomain] = useState("retail");
  const [scenarioIdx, setScenarioIdx] = useState(0);
  const [stage, setStage] = useState("input");      // input, submitted, graded
  const [validity, setValidity] = useState("");
  const [practical, setPractical] = useState("");
  const [segmentation, setSegmentation] = useState("");
  const [threats, setThreats] = useState("");
  const [shipDecision, setShipDecision] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const domainScenarios = AB_TEST_SCENARIOS.filter(s => s.domain === activeDomain);
  const scenario = domainScenarios[scenarioIdx];
  const domainObj = KPI_DOMAINS.find(d => d.id === activeDomain);
  const domainColor = domainObj?.color || C.accent;

  const handleDomainChange = (id) => {
    setActiveDomain(id);
    setScenarioIdx(0);
    resetForm();
  };

  const resetForm = () => {
    setStage("input");
    setValidity("");
    setPractical("");
    setSegmentation("");
    setThreats("");
    setShipDecision("");
    setFeedback(null);
    setError("");
  };

  const grade = async () => {
    if (!apiKey) { setError("Add your Anthropic API key above to grade your reasoning."); return; }
    if (!validity.trim() || !practical.trim() || !segmentation.trim() || !threats.trim() || !shipDecision.trim()) {
      setError("Fill in all five fields before grading.");
      return;
    }

    setLoading(true);
    setError("");

    const prompt = `You are a senior data analyst evaluating a junior analyst's analysis of an A/B test result.

DOMAIN: ${activeDomain}

HYPOTHESIS: ${scenario.hypothesis}

SETUP: ${scenario.setup}

RESULTS: ${scenario.results}

SEGMENT BREAKDOWN: ${scenario.segments}

NOTES / POTENTIAL ISSUES: ${scenario.redFlags}

GOLD-STANDARD ANSWERS (what a senior analyst would say):
STATISTICAL VALIDITY: ${scenario.goldStandard.validity}
PRACTICAL SIGNIFICANCE: ${scenario.goldStandard.practical}
SEGMENTATION ANALYSIS: ${scenario.goldStandard.segmentation}
THREATS / RED FLAGS: ${scenario.goldStandard.threats}
SHIP DECISION: ${scenario.goldStandard.shipDecision}

USER'S ANSWERS:
STATISTICAL VALIDITY: ${validity}
PRACTICAL SIGNIFICANCE: ${practical}
SEGMENTATION ANALYSIS: ${segmentation}
THREATS / RED FLAGS: ${threats}
SHIP DECISION: ${shipDecision}

Grade the user on each of these 5 dimensions (each 0-3 scale):
- 0 = missed entirely or fundamentally wrong
- 1 = surface-level, missed the key consideration
- 2 = solid analyst answer
- 3 = senior-analyst answer with nuance

Output structured plain text in this exact format:

VALIDITY_SCORE: [0-3]
VALIDITY_FEEDBACK: [1-2 sentences on whether they correctly evaluated statistical validity]

PRACTICAL_SCORE: [0-3]
PRACTICAL_FEEDBACK: [1-2 sentences on whether they distinguished statistical from practical significance]

SEGMENTATION_SCORE: [0-3]
SEGMENTATION_FEEDBACK: [1-2 sentences on whether they identified heterogeneous treatment effects]

THREATS_SCORE: [0-3]
THREATS_FEEDBACK: [1-2 sentences on whether they identified methodological threats — novelty, SRM, peeking, network effects, confounds]

SHIP_DECISION_SCORE: [0-3]
SHIP_DECISION_FEEDBACK: [1-2 sentences on whether their ship recommendation was clear, supported by the data, and named tradeoffs]

OVERALL: [strong, partial, or weak]
KEY_TAKEAWAY: [one sentence — the single most important framing they missed or got right]

Plain text only, no markdown. Be honest and discriminating — don't grade leniently. A "strong" rating should be reserved for senior-analyst-quality work. "Partial" is the realistic ceiling for most junior responses. Statistical significance without practical significance, or missing a major threat, should produce a weak rating regardless of how much was written.`;

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true",
        },
        body: JSON.stringify({
          model: "claude-opus-4-5",
          max_tokens: 2000,
          messages: [{ role: "user", content: prompt }],
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error?.message || `API error ${res.status}`);
      }
      const data = await res.json();
      const text = data.content?.[0]?.text || "";
      setFeedback(text);
      setStage("graded");

      const overallMatch = text.match(/OVERALL:\s*(strong|partial|weak)/i);
      if (overallMatch) {
        const score = overallMatch[1].toLowerCase();
        onScore(`intel-abtest-${activeDomain}`, scenarioIdx, score, { q: scenario.hypothesis.slice(0, 80) });
      }
    } catch (e) {
      setError(e.message || "Grading failed");
    }
    setLoading(false);
  };

  const next = () => {
    setScenarioIdx(i => (i + 1) % domainScenarios.length);
    resetForm();
  };

  const prev = () => {
    setScenarioIdx(i => (i - 1 + domainScenarios.length) % domainScenarios.length);
    resetForm();
  };

  return (
    <div>
      {/* Domain selector */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
        {KPI_DOMAINS.map(d => (
          <button
            key={d.id}
            onClick={() => handleDomainChange(d.id)}
            style={{
              padding: "7px 14px", borderRadius: 6, border: `1.5px solid ${activeDomain === d.id ? d.color : C.border}`,
              background: activeDomain === d.id ? d.color + "18" : "transparent",
              color: activeDomain === d.id ? d.color : C.muted,
              fontFamily: mono, fontSize: 10, cursor: "pointer", letterSpacing: "0.06em",
            }}
          >
            {d.icon} {d.label}
          </button>
        ))}
      </div>

      {/* Scenario nav */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <span style={{ fontFamily: mono, fontSize: 11, color: C.muted }}>
          Scenario {scenarioIdx + 1} of {domainScenarios.length}
        </span>
        <div style={{ display: "flex", gap: 6 }}>
          <button onClick={prev} style={{ padding: "5px 12px", borderRadius: 4, border: `1px solid ${C.border}`, background: "transparent", color: C.muted, fontFamily: mono, fontSize: 10, cursor: "pointer" }}>← Prev</button>
          <button onClick={next} style={{ padding: "5px 12px", borderRadius: 4, border: `1px solid ${C.border}`, background: "transparent", color: C.muted, fontFamily: mono, fontSize: 10, cursor: "pointer" }}>Next →</button>
        </div>
      </div>

      {/* Hypothesis & Setup */}
      <div style={{ background: C.card, border: `1.5px solid ${domainColor}`, borderRadius: 12, padding: "16px 20px", marginBottom: 12 }}>
        <div style={{ fontFamily: mono, fontSize: 10, color: domainColor, letterSpacing: "0.12em", marginBottom: 8 }}>
          {domainObj?.icon} HYPOTHESIS
        </div>
        <div style={{ fontSize: 14, color: C.text, lineHeight: 1.6, marginBottom: 12 }}>{scenario.hypothesis}</div>
        <div style={{ fontFamily: mono, fontSize: 10, color: C.muted, letterSpacing: "0.12em", marginBottom: 6 }}>SETUP</div>
        <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.6 }}>{scenario.setup}</div>
      </div>

      {/* Results display */}
      <div style={{ background: C.card, border: `1.5px solid ${C.border}`, borderRadius: 12, padding: 18, marginBottom: 12 }}>
        <div style={{ fontFamily: mono, fontSize: 10, color: C.muted, letterSpacing: "0.12em", marginBottom: 12 }}>EXPERIMENT RESULTS</div>

        {/* Treatment vs Control table */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
          <div style={{ background: C.surface, border: `1px solid ${C.ok}`, borderRadius: 6, padding: "10px 12px" }}>
            <div style={{ fontFamily: mono, fontSize: 10, color: C.ok, letterSpacing: "0.12em", marginBottom: 6 }}>TREATMENT</div>
            {Object.entries(scenario.metrics.treatment).map(([k, v]) => (
              <div key={k} style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 3 }}>
                <span style={{ color: C.muted, fontFamily: mono }}>{k}</span>
                <span style={{ color: C.text, fontFamily: mono }}>{v}</span>
              </div>
            ))}
          </div>
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 6, padding: "10px 12px" }}>
            <div style={{ fontFamily: mono, fontSize: 10, color: C.muted, letterSpacing: "0.12em", marginBottom: 6 }}>CONTROL</div>
            {Object.entries(scenario.metrics.control).map(([k, v]) => (
              <div key={k} style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 3 }}>
                <span style={{ color: C.muted, fontFamily: mono }}>{k}</span>
                <span style={{ color: C.text, fontFamily: mono }}>{v}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: 10 }}>
          <div style={{ fontFamily: mono, fontSize: 10, color: domainColor, letterSpacing: "0.12em", marginBottom: 4 }}>RESULTS</div>
          <div style={{ fontSize: 12, color: C.text, lineHeight: 1.6 }}>{scenario.results}</div>
        </div>

        <div style={{ marginBottom: 10 }}>
          <div style={{ fontFamily: mono, fontSize: 10, color: domainColor, letterSpacing: "0.12em", marginBottom: 4 }}>SEGMENT BREAKDOWN</div>
          <div style={{ fontSize: 12, color: C.text, lineHeight: 1.6 }}>{scenario.segments}</div>
        </div>

        <div>
          <div style={{ fontFamily: mono, fontSize: 10, color: domainColor, letterSpacing: "0.12em", marginBottom: 4 }}>NOTES / POTENTIAL ISSUES</div>
          <div style={{ fontSize: 12, color: C.text, lineHeight: 1.6 }}>{scenario.redFlags}</div>
        </div>
      </div>

      {/* Structured input */}
      <div style={{ background: C.card, border: `1.5px solid ${C.border}`, borderRadius: 12, padding: 18, marginBottom: 14 }}>
        <div style={{ fontFamily: mono, fontSize: 10, color: C.muted, letterSpacing: "0.12em", marginBottom: 14 }}>
          YOUR ANALYSIS — 5 DIMENSIONS
        </div>

        <div style={{ marginBottom: 14 }}>
          <div style={{ fontFamily: mono, fontSize: 10, color: domainColor, letterSpacing: "0.12em", marginBottom: 5 }}>
            1. STATISTICAL VALIDITY — is this a valid result?
          </div>
          <textarea
            value={validity}
            onChange={e => setValidity(e.target.value)}
            disabled={stage === "graded"}
            placeholder="Sample size, p-values, confidence intervals, test duration..."
            style={{
              width: "100%", minHeight: 50, padding: "8px 10px",
              background: C.surface, border: `1px solid ${C.border}`, borderRadius: 5,
              color: C.text, fontSize: 12, fontFamily: "inherit", resize: "vertical",
            }}
          />
        </div>

        <div style={{ marginBottom: 14 }}>
          <div style={{ fontFamily: mono, fontSize: 10, color: domainColor, letterSpacing: "0.12em", marginBottom: 5 }}>
            2. PRACTICAL SIGNIFICANCE — is the effect size meaningful?
          </div>
          <textarea
            value={practical}
            onChange={e => setPractical(e.target.value)}
            disabled={stage === "graded"}
            placeholder="Magnitude of effect, business impact, opportunity cost..."
            style={{
              width: "100%", minHeight: 50, padding: "8px 10px",
              background: C.surface, border: `1px solid ${C.border}`, borderRadius: 5,
              color: C.text, fontSize: 12, fontFamily: "inherit", resize: "vertical",
            }}
          />
        </div>

        <div style={{ marginBottom: 14 }}>
          <div style={{ fontFamily: mono, fontSize: 10, color: domainColor, letterSpacing: "0.12em", marginBottom: 5 }}>
            3. SEGMENTATION — are there heterogeneous treatment effects?
          </div>
          <textarea
            value={segmentation}
            onChange={e => setSegmentation(e.target.value)}
            disabled={stage === "graded"}
            placeholder="Which segments benefited / were harmed? What does the variance tell you?"
            style={{
              width: "100%", minHeight: 50, padding: "8px 10px",
              background: C.surface, border: `1px solid ${C.border}`, borderRadius: 5,
              color: C.text, fontSize: 12, fontFamily: "inherit", resize: "vertical",
            }}
          />
        </div>

        <div style={{ marginBottom: 14 }}>
          <div style={{ fontFamily: mono, fontSize: 10, color: domainColor, letterSpacing: "0.12em", marginBottom: 5 }}>
            4. THREATS — what could be wrong with this result?
          </div>
          <textarea
            value={threats}
            onChange={e => setThreats(e.target.value)}
            disabled={stage === "graded"}
            placeholder="Novelty effect, SRM, peeking, confounds, network effects, missing measurements..."
            style={{
              width: "100%", minHeight: 60, padding: "8px 10px",
              background: C.surface, border: `1px solid ${C.border}`, borderRadius: 5,
              color: C.text, fontSize: 12, fontFamily: "inherit", resize: "vertical",
            }}
          />
        </div>

        <div style={{ marginBottom: 14 }}>
          <div style={{ fontFamily: mono, fontSize: 10, color: domainColor, letterSpacing: "0.12em", marginBottom: 5 }}>
            5. SHIP DECISION — ship, iterate, or kill? Why? What guardrails?
          </div>
          <textarea
            value={shipDecision}
            onChange={e => setShipDecision(e.target.value)}
            disabled={stage === "graded"}
            placeholder="Your recommendation. Be specific. Name the tradeoffs and the monitoring metrics."
            style={{
              width: "100%", minHeight: 80, padding: "8px 10px",
              background: C.surface, border: `1px solid ${C.border}`, borderRadius: 5,
              color: C.text, fontSize: 12, fontFamily: "inherit", resize: "vertical",
            }}
          />
        </div>

        <div style={{ marginTop: 14, display: "flex", gap: 8 }}>
          {stage === "input" && (
            <button onClick={grade} disabled={loading} style={{
              padding: "10px 24px", borderRadius: 6, border: `1.5px solid ${C.ok}`,
              background: C.ok + "18", color: C.ok,
              fontFamily: mono, fontSize: 11, cursor: loading ? "wait" : "pointer", letterSpacing: "0.06em",
            }}>
              {loading ? "Grading (15-30 sec)..." : "Grade with AI"}
            </button>
          )}
          {stage === "graded" && (
            <button onClick={resetForm} style={{
              padding: "10px 24px", borderRadius: 6, border: `1.5px solid ${C.border}`,
              background: "transparent", color: C.muted,
              fontFamily: mono, fontSize: 11, cursor: "pointer", letterSpacing: "0.06em",
            }}>
              Try Again
            </button>
          )}
        </div>
      </div>

      {error && (
        <div style={{ background: C.err + "15", border: `1px solid ${C.err}`, borderRadius: 8, padding: "12px 14px", marginBottom: 12, color: C.err, fontSize: 12 }}>
          {error}
        </div>
      )}

      {feedback && stage === "graded" && (
        <div style={{ background: C.card, border: `1.5px solid ${C.ok}`, borderRadius: 12, padding: 18 }}>
          <div style={{ fontFamily: mono, fontSize: 10, color: C.ok, letterSpacing: "0.12em", marginBottom: 10 }}>AI FEEDBACK</div>
          <pre style={{ whiteSpace: "pre-wrap", fontSize: 12, color: C.text, lineHeight: 1.65, fontFamily: mono, margin: 0 }}>{feedback}</pre>

          <div style={{ marginTop: 18, paddingTop: 16, borderTop: `1px solid ${C.border}` }}>
            <div style={{ fontFamily: mono, fontSize: 10, color: C.accent, letterSpacing: "0.12em", marginBottom: 12 }}>SENIOR-ANALYST GOLD STANDARD</div>

            <div style={{ marginBottom: 12 }}>
              <div style={{ fontFamily: mono, fontSize: 10, color: C.muted, marginBottom: 4 }}>STATISTICAL VALIDITY</div>
              <div style={{ fontSize: 12, color: C.text, lineHeight: 1.6 }}>{scenario.goldStandard.validity}</div>
            </div>
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontFamily: mono, fontSize: 10, color: C.muted, marginBottom: 4 }}>PRACTICAL SIGNIFICANCE</div>
              <div style={{ fontSize: 12, color: C.text, lineHeight: 1.6 }}>{scenario.goldStandard.practical}</div>
            </div>
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontFamily: mono, fontSize: 10, color: C.muted, marginBottom: 4 }}>SEGMENTATION</div>
              <div style={{ fontSize: 12, color: C.text, lineHeight: 1.6 }}>{scenario.goldStandard.segmentation}</div>
            </div>
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontFamily: mono, fontSize: 10, color: C.muted, marginBottom: 4 }}>THREATS</div>
              <div style={{ fontSize: 12, color: C.text, lineHeight: 1.6 }}>{scenario.goldStandard.threats}</div>
            </div>
            <div>
              <div style={{ fontFamily: mono, fontSize: 10, color: C.muted, marginBottom: 4 }}>SHIP DECISION</div>
              <div style={{ fontSize: 12, color: C.text, lineHeight: 1.6, fontStyle: "italic" }}>{scenario.goldStandard.shipDecision}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
function IntelMode({ apiKey, progress, onScore }) {
  const [submode, setSubmode] = useState("library");

  return (
    <div style={{ padding: "0 0 40px 0" }}>
      {/* Sub-mode selector */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 24, paddingBottom: 18, borderBottom: `1px solid ${C.border}` }}>
        {INTEL_SUBMODES.map(m => (
          <button
            key={m.id}
            onClick={() => setSubmode(m.id)}
            style={{
              padding: "10px 18px", borderRadius: 8,
              border: `1.5px solid ${submode === m.id ? C.accent : C.border}`,
              background: submode === m.id ? C.accent + "18" : "transparent",
              color: submode === m.id ? C.accent : C.muted,
              fontFamily: mono, fontSize: 12, cursor: "pointer", letterSpacing: "0.04em",
              display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 2,
            }}
          >
            <span>{m.label}</span>
            <span style={{ fontSize: 9, opacity: 0.7, letterSpacing: "0.08em" }}>{m.description}</span>
          </button>
        ))}
      </div>

      {submode === "library"   && <KPILibraryMode apiKey={apiKey} progress={progress} onScore={onScore} />}
      {submode === "dashboard" && <DashboardDrillMode apiKey={apiKey} progress={progress} onScore={onScore} />}
      {submode === "problem"   && <ProblemMetricMode apiKey={apiKey} progress={progress} onScore={onScore} />}
      {submode === "insight"   && <InsightRecMode apiKey={apiKey} progress={progress} onScore={onScore} />}
      {submode === "abtest"    && <ABTestMode apiKey={apiKey} progress={progress} onScore={onScore} />}
    </div>
  );
}

// ── MODE 2: DASHBOARD COMPREHENSION DRILL ─────────────────────────────────

function DashboardDrillMode({ apiKey, progress, onScore }) {
  const [drillIdx, setDrillIdx] = useState(0);
  const [stage, setStage] = useState("ready");      // ready, active, submitted, graded
  const [timeLeft, setTimeLeft] = useState(60);
  const [answers, setAnswers] = useState(["", "", ""]);
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const drill = DASHBOARD_DRILLS[drillIdx];

  // Timer
  useEffect(() => {
    if (stage !== "active") return;
    if (timeLeft <= 0) {
      setStage("submitted");
      return;
    }
    const t = setTimeout(() => setTimeLeft(s => s - 1), 1000);
    return () => clearTimeout(t);
  }, [stage, timeLeft]);

  const start = () => {
    setStage("active");
    setTimeLeft(60);
    setAnswers(["", "", ""]);
    setFeedback(null);
    setError("");
  };

  const submit = () => {
    setStage("submitted");
  };

  const grade = async () => {
    if (!apiKey) { setError("Add your Anthropic API key above to grade your answers."); return; }
    setLoading(true);
    setError("");

    const prompt = `You are a senior data analyst evaluating a junior analyst's response to a dashboard reading drill.

DRILL CONTEXT:
${drill.scenario}

DASHBOARD: ${drill.title} — ${drill.subtitle}

The user had 60 seconds to answer three questions. Grade each answer on a 0-3 scale:
- 0: missed entirely
- 1: surface-level observation, missed the real story
- 2: solid analyst answer, captured the main point
- 3: senior analyst answer, caught nuance and went beyond the obvious

For each question, output:
- SCORE: [0-3]
- WHAT_THEY_GOT: [1 sentence]
- WHAT_THEY_MISSED: [1-2 sentences, drawing from the gold-standard answer]
- SENIOR_FRAMING: [1 sentence on how a senior would have framed it]

Then output:
- OVERALL: [strong, partial, or weak]
- ONE_THING_TO_REMEMBER: [single most important takeaway]

QUESTION 1: ${drill.questions[0].q}
GOLD ANSWER: ${drill.questions[0].gold}
USER ANSWER: ${answers[0] || "(no answer)"}

QUESTION 2: ${drill.questions[1].q}
GOLD ANSWER: ${drill.questions[1].gold}
USER ANSWER: ${answers[1] || "(no answer)"}

QUESTION 3: ${drill.questions[2].q}
GOLD ANSWER: ${drill.questions[2].gold}
USER ANSWER: ${answers[2] || "(no answer)"}

Output structured plain text only, no markdown.`;

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true",
        },
        body: JSON.stringify({
          model: "claude-opus-4-5",
          max_tokens: 1500,
          messages: [{ role: "user", content: prompt }],
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error?.message || `API error ${res.status}`);
      }
      const data = await res.json();
      const text = data.content?.[0]?.text || "";
      setFeedback(text);
      setStage("graded");

      // Parse OVERALL for score
      const overallMatch = text.match(/OVERALL:\s*(strong|partial|weak)/i);
      if (overallMatch) {
        const score = overallMatch[1].toLowerCase();
        onScore(`intel-dash-${drill.domain}`, drillIdx, score, { q: drill.title });
      }
    } catch (e) {
      setError(e.message || "Grading failed");
    }
    setLoading(false);
  };

  const next = () => {
    setDrillIdx(i => (i + 1) % DASHBOARD_DRILLS.length);
    setStage("ready");
    setAnswers(["", "", ""]);
    setFeedback(null);
    setTimeLeft(60);
    setError("");
  };

  const prev = () => {
    setDrillIdx(i => (i - 1 + DASHBOARD_DRILLS.length) % DASHBOARD_DRILLS.length);
    setStage("ready");
    setAnswers(["", "", ""]);
    setFeedback(null);
    setTimeLeft(60);
    setError("");
  };

  const domainColor = KPI_DOMAINS.find(d => d.id === drill.domain)?.color || C.accent;
  const domainLabel = KPI_DOMAINS.find(d => d.id === drill.domain)?.label || drill.domain;

  return (
    <div>
      {/* Header bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, paddingBottom: 14, borderBottom: `1px solid ${C.border}` }}>
        <div>
          <div style={{ fontFamily: mono, fontSize: 10, color: domainColor, letterSpacing: "0.12em" }}>
            DRILL {drillIdx + 1} / {DASHBOARD_DRILLS.length} · {domainLabel.toUpperCase()}
          </div>
          <div style={{ fontFamily: mono, fontSize: 11, color: C.muted, marginTop: 4 }}>
            60-second timed dashboard reading
          </div>
        </div>
        <div style={{
          fontFamily: mono, fontSize: 28, fontWeight: 700,
          color: timeLeft > 20 ? C.ok : timeLeft > 10 ? C.warn : C.err,
          minWidth: 70, textAlign: "right",
        }}>
          0:{String(timeLeft).padStart(2, "0")}
        </div>
      </div>

      {/* Scenario */}
      <div style={{ background: C.card, border: `1.5px solid ${C.border}`, borderRadius: 12, padding: "14px 18px", marginBottom: 14 }}>
        <div style={{ fontFamily: mono, fontSize: 10, color: C.muted, letterSpacing: "0.12em", marginBottom: 6 }}>SCENARIO</div>
        <div style={{ fontSize: 13, lineHeight: 1.55, color: C.text }}>{drill.scenario}</div>
      </div>

      {/* Dashboard */}
      <div style={{ background: C.card, border: `1.5px solid ${C.border}`, borderRadius: 12, padding: 18, marginBottom: 14 }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: C.text, marginBottom: 4 }}>{drill.title}</div>
        <div style={{ fontFamily: mono, fontSize: 11, color: C.muted, marginBottom: 16 }}>{drill.subtitle}</div>

        {/* KPIs */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 10, marginBottom: 18 }}>
          {drill.kpis.map((k, i) => (
            <div key={i} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: 12 }}>
              <div style={{ fontFamily: mono, fontSize: 9, color: C.muted, letterSpacing: "0.12em", marginBottom: 5 }}>{k.label}</div>
              <div style={{ fontSize: 19, fontWeight: 700, marginBottom: 3 }}>{k.value}</div>
              <div style={{ fontFamily: mono, fontSize: 10, color: k.up ? C.ok : C.err }}>{k.delta}</div>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
          {drill.charts.slice(0, 2).map((chart, i) => (
            <div key={i} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: 12 }}>
              <div style={{ fontFamily: mono, fontSize: 10, color: C.muted, letterSpacing: "0.12em", marginBottom: 10 }}>{chart.title}</div>
              <DrillChart chart={chart} />
            </div>
          ))}
        </div>
        {drill.charts[2] && (
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: 12 }}>
            <div style={{ fontFamily: mono, fontSize: 10, color: C.muted, letterSpacing: "0.12em", marginBottom: 10 }}>{drill.charts[2].title}</div>
            <DrillChart chart={drill.charts[2]} />
          </div>
        )}
      </div>

      {/* Answer phase */}
      {stage === "ready" && (
        <div style={{ textAlign: "center", padding: 24 }}>
          <button onClick={start} style={{
            padding: "14px 40px", borderRadius: 8, border: `1.5px solid ${domainColor}`,
            background: domainColor + "18", color: domainColor,
            fontFamily: mono, fontSize: 13, cursor: "pointer", letterSpacing: "0.08em",
          }}>
            Start 60-Second Drill
          </button>
          <div style={{ marginTop: 12, fontFamily: mono, fontSize: 11, color: C.muted }}>
            Answer 3 questions about this dashboard. Timer starts on click.
          </div>
        </div>
      )}

      {(stage === "active" || stage === "submitted") && (
        <div style={{ background: C.card, border: `1.5px solid ${C.border}`, borderRadius: 12, padding: 18 }}>
          {drill.questions.map((q, i) => (
            <div key={i} style={{ marginBottom: 14 }}>
              <div style={{ fontFamily: mono, fontSize: 10, color: domainColor, letterSpacing: "0.12em", marginBottom: 4 }}>QUESTION {i + 1} OF 3</div>
              <div style={{ fontSize: 13, marginBottom: 8, color: C.text }}>{q.q}</div>
              <textarea
                value={answers[i]}
                onChange={e => setAnswers(a => { const n = [...a]; n[i] = e.target.value; return n; })}
                disabled={stage === "submitted"}
                placeholder="Your answer..."
                style={{
                  width: "100%", minHeight: 60, background: C.surface, border: `1px solid ${C.border}`,
                  borderRadius: 6, padding: 10, color: C.text, fontSize: 13, resize: "vertical",
                  fontFamily: "inherit",
                }}
              />
            </div>
          ))}
          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
            {stage === "active" && (
              <button onClick={submit} style={{
                padding: "10px 22px", borderRadius: 6, border: `1.5px solid ${C.accent}`,
                background: C.accent + "18", color: C.accent,
                fontFamily: mono, fontSize: 11, cursor: "pointer", letterSpacing: "0.06em",
              }}>
                Submit Now
              </button>
            )}
            {stage === "submitted" && (
              <button onClick={grade} disabled={loading} style={{
                padding: "10px 22px", borderRadius: 6, border: `1.5px solid ${C.ok}`,
                background: C.ok + "18", color: C.ok,
                fontFamily: mono, fontSize: 11, cursor: loading ? "wait" : "pointer", letterSpacing: "0.06em",
              }}>
                {loading ? "Grading..." : "Grade with AI"}
              </button>
            )}
          </div>
        </div>
      )}

      {error && (
        <div style={{ background: C.err + "15", border: `1px solid ${C.err}`, borderRadius: 8, padding: "12px 14px", marginTop: 12, color: C.err, fontSize: 12 }}>
          {error}
        </div>
      )}

      {feedback && stage === "graded" && (
        <div style={{ background: C.card, border: `1.5px solid ${C.ok}`, borderRadius: 12, padding: 18, marginTop: 14 }}>
          <div style={{ fontFamily: mono, fontSize: 10, color: C.ok, letterSpacing: "0.12em", marginBottom: 10 }}>AI FEEDBACK</div>
          <pre style={{ whiteSpace: "pre-wrap", fontSize: 12, color: C.text, lineHeight: 1.65, fontFamily: mono, margin: 0 }}>{feedback}</pre>

          {/* Show gold-standard answers */}
          <div style={{ marginTop: 18, paddingTop: 16, borderTop: `1px solid ${C.border}` }}>
            <div style={{ fontFamily: mono, fontSize: 10, color: C.accent, letterSpacing: "0.12em", marginBottom: 10 }}>GOLD-STANDARD SENIOR ANSWERS</div>
            {drill.questions.map((q, i) => (
              <div key={i} style={{ marginBottom: 12 }}>
                <div style={{ fontFamily: mono, fontSize: 10, color: C.muted, marginBottom: 4 }}>Q{i + 1}</div>
                <div style={{ fontSize: 12, color: C.text, lineHeight: 1.6 }}>{q.gold}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Navigation */}
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 16, gap: 8 }}>
        <button onClick={prev} style={{
          padding: "10px 22px", borderRadius: 8, border: `1.5px solid ${C.border}`,
          background: "transparent", color: C.text,
          fontFamily: mono, fontSize: 12, cursor: "pointer",
        }}>← Prev Drill</button>
        <button onClick={next} style={{
          padding: "10px 22px", borderRadius: 8, border: `1.5px solid ${domainColor}`,
          background: domainColor + "18", color: domainColor,
          fontFamily: mono, fontSize: 12, cursor: "pointer",
        }}>Next Drill →</button>
      </div>
    </div>
  );
}

// ── DRILL CHART RENDERER (inline SVG) ──────────────────────────────────────

function DrillChart({ chart }) {
  if (chart.type === "lineMulti") {
    const yMax = chart.yMax || 100;
    const w = 360, h = 160, padL = 36, padR = 12, padT = 12, padB = 28;
    const innerW = w - padL - padR;
    const innerH = h - padT - padB;
    const xCount = chart.series[0].points.length;
    const xStep = innerW / (xCount - 1);
    const yScale = v => padT + (1 - v / yMax) * innerH;
    const xPos = i => padL + i * xStep;

    return (
      <svg viewBox={`0 0 ${w} ${h}`} style={{ width: "100%", height: "auto" }}>
        {/* Grid */}
        {[0.25, 0.5, 0.75].map(t => (
          <line key={t} x1={padL} y1={padT + t * innerH} x2={w - padR} y2={padT + t * innerH}
            stroke={C.border} strokeWidth="0.5" strokeDasharray="2,3" opacity="0.4" />
        ))}
        {/* Axes */}
        <line x1={padL} y1={padT} x2={padL} y2={padT + innerH} stroke={C.border} strokeWidth="1" />
        <line x1={padL} y1={padT + innerH} x2={w - padR} y2={padT + innerH} stroke={C.border} strokeWidth="1" />
        {/* Y labels */}
        {[0, 0.5, 1].map(t => (
          <text key={t} x={padL - 4} y={padT + (1 - t) * innerH + 3} textAnchor="end"
            fontSize="9" fill={C.muted} fontFamily={mono}>
            {Math.round(yMax * t)}
          </text>
        ))}
        {/* X labels */}
        {chart.xLabels.map((lbl, i) => (
          <text key={i} x={xPos(i)} y={h - 8} textAnchor="middle" fontSize="9" fill={C.muted} fontFamily={mono}>
            {lbl}
          </text>
        ))}
        {/* Series */}
        {chart.series.map((s, si) => (
          <g key={si}>
            <polyline points={s.points.map((v, i) => `${xPos(i)},${yScale(v)}`).join(" ")}
              fill="none" stroke={s.color} strokeWidth="2" />
            {s.points.map((v, i) => (
              <circle key={i} cx={xPos(i)} cy={yScale(v)} r="2.5" fill={s.color} />
            ))}
          </g>
        ))}
        {/* Legend */}
        <g transform={`translate(${padL + 8}, ${padT - 2})`}>
          {chart.series.map((s, si) => (
            <g key={si} transform={`translate(${si * 90}, 0)`}>
              <rect x="0" y="-1" width="10" height="2" fill={s.color} />
              <text x="14" y="3" fontSize="9" fill={C.muted} fontFamily={mono}>{s.label}</text>
            </g>
          ))}
        </g>
      </svg>
    );
  }

  if (chart.type === "barCategorical") {
    const yMax = chart.yMax || Math.max(...chart.bars.map(b => b.value));
    const w = 280, h = 160, padL = 40, padR = 12, padT = 14, padB = 28;
    const innerW = w - padL - padR;
    const innerH = h - padT - padB;
    const barW = innerW / chart.bars.length * 0.6;
    const gap = innerW / chart.bars.length * 0.4;

    return (
      <svg viewBox={`0 0 ${w} ${h}`} style={{ width: "100%", height: "auto" }}>
        {[0.25, 0.5, 0.75].map(t => (
          <line key={t} x1={padL} y1={padT + t * innerH} x2={w - padR} y2={padT + t * innerH}
            stroke={C.border} strokeWidth="0.5" strokeDasharray="2,3" opacity="0.4" />
        ))}
        <line x1={padL} y1={padT} x2={padL} y2={padT + innerH} stroke={C.border} strokeWidth="1" />
        <line x1={padL} y1={padT + innerH} x2={w - padR} y2={padT + innerH} stroke={C.border} strokeWidth="1" />
        {[0, 0.5, 1].map(t => (
          <text key={t} x={padL - 4} y={padT + (1 - t) * innerH + 3} textAnchor="end"
            fontSize="9" fill={C.muted} fontFamily={mono}>
            {Math.round(yMax * t)}{chart.unit || ""}
          </text>
        ))}
        {chart.bars.map((b, i) => {
          const barH = (b.value / yMax) * innerH;
          const x = padL + gap / 2 + i * (barW + gap);
          const y = padT + innerH - barH;
          return (
            <g key={i}>
              <rect x={x} y={y} width={barW} height={barH} fill={b.color} opacity="0.85" />
              <text x={x + barW / 2} y={y - 4} textAnchor="middle" fontSize="9" fill={b.color} fontFamily={mono}>
                {b.value}{chart.unit || ""}
              </text>
              <text x={x + barW / 2} y={h - 8} textAnchor="middle" fontSize="9" fill={C.muted} fontFamily={mono}>
                {b.label}
              </text>
            </g>
          );
        })}
      </svg>
    );
  }

  if (chart.type === "barHorizontal") {
    const w = 540, h = 130;
    const labelW = 150;
    const barAreaW = w - labelW - 60;
    const max = Math.max(...chart.bars.map(b => b.max || b.value));
    const rowH = 22;

    return (
      <svg viewBox={`0 0 ${w} ${h}`} style={{ width: "100%", height: "auto" }}>
        {chart.bars.map((b, i) => {
          const y = i * rowH + 10;
          const barW = (b.value / max) * barAreaW;
          return (
            <g key={i}>
              <text x="6" y={y + 11} fontSize="10" fill={C.text} fontFamily={mono}>
                {b.label}
              </text>
              <rect x={labelW} y={y} width={barAreaW} height="14" fill={C.surface} stroke={C.border} strokeWidth="0.5" />
              <rect x={labelW} y={y} width={barW} height="14" fill={C.accent} opacity="0.85" />
              <text x={labelW + barW + 6} y={y + 11} fontSize="9" fill={C.muted} fontFamily={mono}>
                {b.value.toLocaleString()}
              </text>
            </g>
          );
        })}
      </svg>
    );
  }

  return null;
}

// ── MODE 3: PROBLEM-TO-METRIC REASONING ────────────────────────────────────

function ProblemMetricMode({ apiKey, progress, onScore }) {
  const [activeDomain, setActiveDomain] = useState("retail");
  const [scenarioIdx, setScenarioIdx] = useState(0);
  const [stage, setStage] = useState("input");      // input, submitted, graded
  const [rankedKPIs, setRankedKPIs] = useState([
    { kpi: "", logic: "" },
    { kpi: "", logic: "" },
    { kpi: "", logic: "" },
  ]);
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const domainScenarios = PROBLEM_SCENARIOS.filter(s => s.domain === activeDomain);
  const scenario = domainScenarios[scenarioIdx];
  const domainObj = KPI_DOMAINS.find(d => d.id === activeDomain);
  const domainColor = domainObj?.color || C.accent;

  const handleDomainChange = (id) => {
    setActiveDomain(id);
    setScenarioIdx(0);
    resetForm();
  };

  const resetForm = () => {
    setStage("input");
    setRankedKPIs([
      { kpi: "", logic: "" },
      { kpi: "", logic: "" },
      { kpi: "", logic: "" },
    ]);
    setFeedback(null);
    setError("");
  };

  const updateKPI = (idx, field, value) => {
    setRankedKPIs(prev => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: value };
      return next;
    });
  };

  const addKPISlot = () => {
    if (rankedKPIs.length < 5) {
      setRankedKPIs(prev => [...prev, { kpi: "", logic: "" }]);
    }
  };

  const removeKPISlot = (idx) => {
    if (rankedKPIs.length > 3) {
      setRankedKPIs(prev => prev.filter((_, i) => i !== idx));
    }
  };

  const grade = async () => {
    if (!apiKey) { setError("Add your Anthropic API key above to grade your reasoning."); return; }
    const filled = rankedKPIs.filter(r => r.kpi.trim());
    if (filled.length < 3) { setError("Provide at least 3 ranked KPIs."); return; }

    setLoading(true);
    setError("");

    const userKPIList = rankedKPIs.map((r, i) => `${i + 1}. ${r.kpi || "(empty)"} — Logic: ${r.logic || "(none)"}`).join("\n");
    const goldKPIList = scenario.goldKPIs.map((g, i) => `${i + 1}. ${g.kpi} — Logic: ${g.logic}`).join("\n");

    const prompt = `You are a senior data analyst evaluating a junior analyst's diagnostic plan.

BUSINESS PROBLEM:
${scenario.problem}

DOMAIN: ${activeDomain}

The user ranked the KPIs they would investigate, in priority order:
${userKPIList}

A senior-analyst-level answer would have proposed (in approximate priority order):
${goldKPIList}

Grade the user on three dimensions (each 0-3):
- COVERAGE: Did they name the right metrics? (overlap with gold)
- ORDER: Did they prioritize correctly? (leading indicators before lagging, root-cause-likely before symptoms)
- REASONING: Does each KPI's logic actually answer the problem?

Output:
- COVERAGE_SCORE: [0-3]
- COVERAGE_FEEDBACK: [1-2 sentences on what they got vs missed]
- ORDER_SCORE: [0-3]
- ORDER_FEEDBACK: [1-2 sentences on prioritization]
- REASONING_SCORE: [0-3]
- REASONING_FEEDBACK: [1-2 sentences on logic quality]
- OVERALL: [strong, partial, or weak]
- KEY_TAKEAWAY: [one sentence — the single most important framing they should have used]

Plain text only, no markdown.`;

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true",
        },
        body: JSON.stringify({
          model: "claude-opus-4-5",
          max_tokens: 1500,
          messages: [{ role: "user", content: prompt }],
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error?.message || `API error ${res.status}`);
      }
      const data = await res.json();
      const text = data.content?.[0]?.text || "";
      setFeedback(text);
      setStage("graded");

      const overallMatch = text.match(/OVERALL:\s*(strong|partial|weak)/i);
      if (overallMatch) {
        const score = overallMatch[1].toLowerCase();
        onScore(`intel-prob-${activeDomain}`, scenarioIdx, score, { q: scenario.problem.slice(0, 80) });
      }
    } catch (e) {
      setError(e.message || "Grading failed");
    }
    setLoading(false);
  };

  const next = () => {
    setScenarioIdx(i => (i + 1) % domainScenarios.length);
    resetForm();
  };

  const prev = () => {
    setScenarioIdx(i => (i - 1 + domainScenarios.length) % domainScenarios.length);
    resetForm();
  };

  return (
    <div>
      {/* Domain selector */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
        {KPI_DOMAINS.map(d => (
          <button
            key={d.id}
            onClick={() => handleDomainChange(d.id)}
            style={{
              padding: "7px 14px", borderRadius: 6, border: `1.5px solid ${activeDomain === d.id ? d.color : C.border}`,
              background: activeDomain === d.id ? d.color + "18" : "transparent",
              color: activeDomain === d.id ? d.color : C.muted,
              fontFamily: mono, fontSize: 10, cursor: "pointer", letterSpacing: "0.06em",
            }}
          >
            {d.icon} {d.label}
          </button>
        ))}
      </div>

      {/* Scenario nav */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <span style={{ fontFamily: mono, fontSize: 11, color: C.muted }}>
          Scenario {scenarioIdx + 1} of {domainScenarios.length}
        </span>
        <div style={{ display: "flex", gap: 6 }}>
          <button onClick={prev} style={{ padding: "5px 12px", borderRadius: 4, border: `1px solid ${C.border}`, background: "transparent", color: C.muted, fontFamily: mono, fontSize: 10, cursor: "pointer" }}>← Prev</button>
          <button onClick={next} style={{ padding: "5px 12px", borderRadius: 4, border: `1px solid ${C.border}`, background: "transparent", color: C.muted, fontFamily: mono, fontSize: 10, cursor: "pointer" }}>Next →</button>
        </div>
      </div>

      {/* Problem statement */}
      <div style={{ background: C.card, border: `1.5px solid ${domainColor}`, borderRadius: 12, padding: "16px 20px", marginBottom: 18 }}>
        <div style={{ fontFamily: mono, fontSize: 10, color: domainColor, letterSpacing: "0.12em", marginBottom: 8 }}>
          {domainObj?.icon} BUSINESS PROBLEM
        </div>
        <div style={{ fontSize: 14, color: C.text, lineHeight: 1.55 }}>{scenario.problem}</div>
      </div>

      {/* Ranked KPI input */}
      <div style={{ background: C.card, border: `1.5px solid ${C.border}`, borderRadius: 12, padding: 18, marginBottom: 14 }}>
        <div style={{ fontFamily: mono, fontSize: 10, color: C.muted, letterSpacing: "0.12em", marginBottom: 14 }}>
          YOUR DIAGNOSTIC PLAN — RANK 3-5 KPIS WITH LOGIC
        </div>
        {rankedKPIs.map((r, i) => (
          <div key={i} style={{ marginBottom: 12, display: "flex", gap: 10, alignItems: "flex-start" }}>
            <div style={{
              width: 28, height: 28, borderRadius: 14, background: domainColor + "22",
              border: `1.5px solid ${domainColor}`, color: domainColor,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: mono, fontSize: 12, fontWeight: 700, flexShrink: 0, marginTop: 4,
            }}>
              {i + 1}
            </div>
            <div style={{ flex: 1 }}>
              <input
                value={r.kpi}
                onChange={e => updateKPI(i, "kpi", e.target.value)}
                disabled={stage === "graded"}
                placeholder="KPI name (e.g., Conversion Rate, Days in AR)"
                style={{
                  width: "100%", padding: "8px 10px", marginBottom: 6,
                  background: C.surface, border: `1px solid ${C.border}`, borderRadius: 5,
                  color: C.text, fontSize: 12, fontFamily: "inherit",
                }}
              />
              <textarea
                value={r.logic}
                onChange={e => updateKPI(i, "logic", e.target.value)}
                disabled={stage === "graded"}
                placeholder="Diagnostic logic — why this KPI, what it tells you..."
                style={{
                  width: "100%", minHeight: 40, padding: "8px 10px",
                  background: C.surface, border: `1px solid ${C.border}`, borderRadius: 5,
                  color: C.text, fontSize: 12, fontFamily: "inherit", resize: "vertical",
                }}
              />
            </div>
            {rankedKPIs.length > 3 && stage === "input" && (
              <button onClick={() => removeKPISlot(i)} style={{
                background: "transparent", border: `1px solid ${C.err}`, color: C.err,
                borderRadius: 4, padding: "4px 8px", fontSize: 10, cursor: "pointer",
                fontFamily: mono, marginTop: 4,
              }}>✕</button>
            )}
          </div>
        ))}
        {rankedKPIs.length < 5 && stage === "input" && (
          <button onClick={addKPISlot} style={{
            padding: "8px 14px", borderRadius: 5, border: `1px dashed ${C.muted}`,
            background: "transparent", color: C.muted,
            fontFamily: mono, fontSize: 11, cursor: "pointer",
          }}>+ Add KPI slot</button>
        )}
        <div style={{ marginTop: 14, display: "flex", gap: 8 }}>
          {stage === "input" && (
            <button onClick={grade} disabled={loading} style={{
              padding: "10px 24px", borderRadius: 6, border: `1.5px solid ${C.ok}`,
              background: C.ok + "18", color: C.ok,
              fontFamily: mono, fontSize: 11, cursor: loading ? "wait" : "pointer", letterSpacing: "0.06em",
            }}>
              {loading ? "Grading..." : "Grade with AI"}
            </button>
          )}
          {stage === "graded" && (
            <button onClick={resetForm} style={{
              padding: "10px 24px", borderRadius: 6, border: `1.5px solid ${C.border}`,
              background: "transparent", color: C.muted,
              fontFamily: mono, fontSize: 11, cursor: "pointer", letterSpacing: "0.06em",
            }}>
              Try Again
            </button>
          )}
        </div>
      </div>

      {error && (
        <div style={{ background: C.err + "15", border: `1px solid ${C.err}`, borderRadius: 8, padding: "12px 14px", marginBottom: 12, color: C.err, fontSize: 12 }}>
          {error}
        </div>
      )}

      {feedback && stage === "graded" && (
        <div style={{ background: C.card, border: `1.5px solid ${C.ok}`, borderRadius: 12, padding: 18 }}>
          <div style={{ fontFamily: mono, fontSize: 10, color: C.ok, letterSpacing: "0.12em", marginBottom: 10 }}>AI FEEDBACK</div>
          <pre style={{ whiteSpace: "pre-wrap", fontSize: 12, color: C.text, lineHeight: 1.65, fontFamily: mono, margin: 0 }}>{feedback}</pre>

          {/* Show gold-standard answer */}
          <div style={{ marginTop: 18, paddingTop: 16, borderTop: `1px solid ${C.border}` }}>
            <div style={{ fontFamily: mono, fontSize: 10, color: C.accent, letterSpacing: "0.12em", marginBottom: 12 }}>SENIOR-ANALYST DIAGNOSTIC PLAN</div>
            {scenario.goldKPIs.map((g, i) => (
              <div key={i} style={{ marginBottom: 10, paddingLeft: 28, position: "relative" }}>
                <div style={{
                  position: "absolute", left: 0, top: 0,
                  width: 22, height: 22, borderRadius: 11, background: C.accent + "22",
                  border: `1px solid ${C.accent}`, color: C.accent,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: mono, fontSize: 10, fontWeight: 700,
                }}>{i + 1}</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 3 }}>{g.kpi}</div>
                <div style={{ fontSize: 11, color: C.muted, lineHeight: 1.55 }}>{g.logic}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function KPILibraryMode({ apiKey, progress, onScore }) {
  const [activeDomain, setActiveDomain] = useState("retail");
  const [cardIdx, setCardIdx] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [sessionScores, setSessionScores] = useState({});

  const domain = KPI_DOMAINS.find(d => d.id === activeDomain);
  const cards = KPI_LIBRARY[activeDomain] || [];
  const card = cards[cardIdx];
  const cardKey = `kpi-${activeDomain}:${cardIdx}`;
  const persistedScore = progress.allTimeScores?.[cardKey];
  const scoredThisSession = sessionScores[cardIdx];

  const handleDomainChange = (id) => {
    setActiveDomain(id);
    setCardIdx(0);
    setRevealed(false);
    setSessionScores({});
  };

  const handleScore = (score) => {
    setSessionScores(s => ({ ...s, [cardIdx]: score }));
    onScore(`kpi-${activeDomain}`, cardIdx, score, { q: card.metric });
  };

  const handleNext = () => {
    setCardIdx(i => Math.min(i + 1, cards.length - 1));
    setRevealed(false);
  };

  const handlePrev = () => {
    setCardIdx(i => Math.max(i - 1, 0));
    setRevealed(false);
  };

  const strong = Object.values(sessionScores).filter(v => v === "strong").length;
  const partial = Object.values(sessionScores).filter(v => v === "partial").length;
  const weak = Object.values(sessionScores).filter(v => v === "weak").length;

  return (
    <div style={{ padding: "0 0 40px 0" }}>

      {/* Domain selector */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
        {KPI_DOMAINS.map(d => (
          <button
            key={d.id}
            onClick={() => handleDomainChange(d.id)}
            style={{
              padding: "8px 16px", borderRadius: 8, border: `1.5px solid ${activeDomain === d.id ? d.color : C.border}`,
              background: activeDomain === d.id ? d.color + "18" : "transparent",
              color: activeDomain === d.id ? d.color : C.muted,
              fontFamily: mono, fontSize: 11, cursor: "pointer", letterSpacing: "0.06em",
              transition: "all 0.15s",
            }}
          >
            {d.icon} {d.label}
          </button>
        ))}
      </div>

      {/* Progress bar */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
        <span style={{ fontFamily: mono, fontSize: 11, color: C.muted }}>
          {cardIdx + 1} / {cards.length}
        </span>
        <div style={{ flex: 1, height: 3, background: C.border, borderRadius: 2 }}>
          <div style={{
            height: "100%", borderRadius: 2, background: domain.color,
            width: `${((cardIdx + 1) / cards.length) * 100}%`, transition: "width 0.3s",
          }} />
        </div>
        <span style={{ fontFamily: mono, fontSize: 10, color: C.muted }}>
          ✓ {strong} · ◑ {partial} · ✗ {weak}
        </span>
      </div>

      {/* Card */}
      {card && (
        <div style={{ background: C.card, border: `1.5px solid ${C.border}`, borderRadius: 12, overflow: "hidden" }}>

          {/* Card header */}
          <div style={{ padding: "18px 20px 14px", borderBottom: `1px solid ${C.border}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
              <div>
                <div style={{ fontFamily: mono, fontSize: 10, color: domain.color, letterSpacing: "0.12em", marginBottom: 6 }}>
                  {domain.icon} {domain.label.toUpperCase()} KPI
                </div>
                <div style={{ fontSize: 20, fontWeight: 700, color: C.text, lineHeight: 1.3 }}>
                  {card.metric}
                </div>
              </div>
              {persistedScore && (
                <div style={{
                  padding: "4px 10px", borderRadius: 6, fontSize: 10, fontFamily: mono, letterSpacing: "0.08em",
                  background: persistedScore === "strong" ? C.ok + "22" : persistedScore === "partial" ? C.warn + "22" : C.err + "22",
                  color: persistedScore === "strong" ? C.ok : persistedScore === "partial" ? C.warn : C.err,
                  border: `1px solid ${persistedScore === "strong" ? C.ok : persistedScore === "partial" ? C.warn : C.err}`,
                  flexShrink: 0,
                }}>
                  {persistedScore}
                </div>
              )}
            </div>

            {/* Formula */}
            <div style={{ marginTop: 14, padding: "10px 14px", background: C.surface, borderRadius: 8, border: `1px solid ${C.border}` }}>
              <span style={{ fontFamily: mono, fontSize: 10, color: C.muted, letterSpacing: "0.1em" }}>FORMULA  </span>
              <span style={{ fontFamily: mono, fontSize: 12, color: domain.color }}>{card.formula}</span>
            </div>
          </div>

          {/* Reveal button / full content */}
          {!revealed ? (
            <div style={{ padding: "24px 20px", textAlign: "center" }}>
              <button
                onClick={() => setRevealed(true)}
                style={{
                  padding: "12px 32px", borderRadius: 8, border: `1.5px solid ${domain.color}`,
                  background: domain.color + "18", color: domain.color,
                  fontFamily: mono, fontSize: 12, cursor: "pointer", letterSpacing: "0.08em",
                }}
              >
                Reveal Decision Context
              </button>
              <div style={{ marginTop: 12, fontFamily: mono, fontSize: 10, color: C.muted }}>
                Think about: why does this metric exist? What decision does it inform?
              </div>
            </div>
          ) : (
            <div style={{ padding: "20px 20px 0" }}>

              {/* Why it matters */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontFamily: mono, fontSize: 10, color: C.muted, letterSpacing: "0.12em", marginBottom: 6 }}>WHY IT MATTERS</div>
                <div style={{ fontSize: 13, color: C.text, lineHeight: 1.7 }}>{card.why}</div>
              </div>

              {/* Decision context */}
              <div style={{ marginBottom: 16, padding: "14px 16px", background: domain.color + "0f", borderRadius: 8, borderLeft: `3px solid ${domain.color}` }}>
                <div style={{ fontFamily: mono, fontSize: 10, color: domain.color, letterSpacing: "0.12em", marginBottom: 6 }}>DECISION CONTEXT</div>
                <div style={{ fontSize: 13, color: C.text, lineHeight: 1.7 }}>{card.decision}</div>
              </div>

              {/* Misinterpretations */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontFamily: mono, fontSize: 10, color: C.err, letterSpacing: "0.12em", marginBottom: 8 }}>COMMON MISINTERPRETATIONS</div>
                {card.misinterpretations.map((m, i) => (
                  <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8, fontSize: 13, color: C.text, lineHeight: 1.65 }}>
                    <span style={{ color: C.err, flexShrink: 0 }}>⚠</span>
                    <span>{m}</span>
                  </div>
                ))}
              </div>

              {/* Role tags */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontFamily: mono, fontSize: 10, color: C.muted, letterSpacing: "0.12em", marginBottom: 8 }}>COMMON ROLE TITLES</div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {card.roles.map((r, i) => (
                    <span key={i} style={{
                      padding: "3px 8px", borderRadius: 4, fontSize: 10, fontFamily: mono,
                      background: C.surface, border: `1px solid ${C.border}`, color: C.muted,
                    }}>{r}</span>
                  ))}
                </div>
              </div>

              {/* Score buttons */}
              {!scoredThisSession && (
                <div style={{ borderTop: `1px solid ${C.border}`, padding: "16px 0", display: "flex", gap: 8 }}>
                  <div style={{ fontFamily: mono, fontSize: 10, color: C.muted, letterSpacing: "0.08em", alignSelf: "center", marginRight: 4 }}>RATE:</div>
                  {[
                    { label: "Strong", score: "strong", color: C.ok },
                    { label: "Partial", score: "partial", color: C.warn },
                    { label: "Weak", score: "weak", color: C.err },
                  ].map(({ label, score, color }) => (
                    <button
                      key={score}
                      onClick={() => handleScore(score)}
                      style={{
                        padding: "8px 20px", borderRadius: 6, border: `1.5px solid ${color}`,
                        background: "transparent", color, fontFamily: mono, fontSize: 11,
                        cursor: "pointer", letterSpacing: "0.06em",
                      }}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              )}

              {scoredThisSession && (
                <div style={{ borderTop: `1px solid ${C.border}`, padding: "14px 0" }}>
                  <span style={{ fontFamily: mono, fontSize: 10, color: C.muted }}>
                    Scored as{" "}
                    <span style={{
                      color: scoredThisSession === "strong" ? C.ok : scoredThisSession === "partial" ? C.warn : C.err
                    }}>
                      {scoredThisSession}
                    </span>
                    {" "}this session
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Navigation */}
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 16, gap: 8 }}>
        <button
          onClick={handlePrev}
          disabled={cardIdx === 0}
          style={{
            padding: "10px 24px", borderRadius: 8, border: `1.5px solid ${C.border}`,
            background: "transparent", color: cardIdx === 0 ? C.muted : C.text,
            fontFamily: mono, fontSize: 12, cursor: cardIdx === 0 ? "not-allowed" : "pointer",
          }}
        >
          ← Prev
        </button>
        <span style={{ fontFamily: mono, fontSize: 11, color: C.muted, alignSelf: "center" }}>
          {Object.keys(sessionScores).length} / {cards.length} reviewed
        </span>
        <button
          onClick={handleNext}
          disabled={cardIdx === cards.length - 1}
          style={{
            padding: "10px 24px", borderRadius: 8, border: `1.5px solid ${domain.color}`,
            background: domain.color + "18", color: domain.color,
            fontFamily: mono, fontSize: 12, cursor: cardIdx === cards.length - 1 ? "not-allowed" : "pointer",
          }}
        >
          Next →
        </button>
      </div>
    </div>
  );
}
export default function App() {
  const [module, setModule] = useState("sql");
  const [tab, setTab] = useState("flashcards");
  const [apiKey, setApiKey] = useState("");
  const [progress, setProgress] = useState(() => loadProgress() || defaultProgress());
  const [activeDomainPack, setActiveDomainPack] = useState(null);
  const [sessionSummary, setSessionSummary] = useState(null);
  const [sessionStart] = useState(Date.now());
  const color = MODULES.find(m => m.id === module)?.color || C.accent;

  // Update streak on load
  useEffect(() => {
    const today = new Date().toDateString();
    if (progress.lastSessionDate !== today) {
      const yesterday = new Date(Date.now() - 86400000).toDateString();
      const newStreak = progress.lastSessionDate === yesterday ? progress.streak : 0;
      const updated = { ...progress, lastSessionDate: today, streak: newStreak };
      setProgress(updated);
      saveProgress(updated);
    }
  }, []);

  const handleScore = useCallback((mod, idx, score, card) => {
    setProgress(prev => {
      const key = `${mod}:${idx}`;
      const allTimeScores = { ...prev.allTimeScores, [key]: score };

      // Spaced repetition tracking
      const prevCounts = prev.scoreCounts?.[key] || { strong: 0, partial: 0, weak: 0 };
      const scoreCounts = {
        ...prev.scoreCounts,
        [key]: { ...prevCounts, [score]: (prevCounts[score] || 0) + 1 }
      };
      const lastSeen = { ...prev.lastSeen, [key]: new Date().toISOString() };

      // Weak queue — add if weak/partial, remove if strong
      let weakQueue = [...(prev.weakQueue || [])];
      const alreadyIn = weakQueue.some(w => w.key === key);
      if (score === "weak" || score === "partial") {
        if (!alreadyIn) weakQueue.push({ key, mod, idx, q: card?.q || "" });
      } else {
        weakQueue = weakQueue.filter(w => w.key !== key);
      }

      const updated = { ...prev, allTimeScores, scoreCounts, lastSeen, weakQueue };
      saveProgress(updated);
      return updated;
    });
  }, []);

  const handleSessionComplete = useCallback(() => {
    setProgress(prev => {
      const today = new Date().toDateString();
      const yesterday = new Date(Date.now() - 86400000).toDateString();
      const newStreak = prev.lastSessionDate === yesterday || prev.lastSessionDate === today
        ? (prev.lastSessionDate === today ? prev.streak : prev.streak + 1)
        : 1;
      const updated = { ...prev, totalSessions: prev.totalSessions + 1, streak: newStreak, lastSessionDate: today };
      saveProgress(updated);
      return updated;
    });
  }, []);

  const handleSessionDone = useCallback((summary) => {
    handleSessionComplete();
    setSessionSummary(summary);
  }, [handleSessionComplete]);

  const resetProgress = () => {
    const fresh = defaultProgress();
    setProgress(fresh);
    saveProgress(fresh);
  };

  return (
    <div style={{ background: C.bg, minHeight: "100vh", fontFamily: sans, color: C.text }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=DM+Mono:wght@400;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: ${C.surface}; }
        ::-webkit-scrollbar-thumb { background: ${C.border}; border-radius: 3px; }
        button { transition: opacity 0.15s; font-family: inherit; }
        button:hover:not(:disabled) { opacity: 0.8; }
      `}</style>

      {/* Header */}
      <div style={{ background: C.surface, borderBottom: `1px solid ${C.border}`, padding: "14px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontFamily: mono, fontWeight: 600, fontSize: 14, letterSpacing: "0.06em" }}>
            <span style={{ color: C.accent }}>⬡ </span>ANALYST SHARPENER
          </div>
          <div style={{ fontFamily: mono, fontSize: 10, color: C.muted, marginTop: 3 }}>
            SQL · EXCEL · TABLEAU · PYTHON — AI-graded daily practice
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: C.accent }}>{progress.streak}</div>
            <div style={{ fontFamily: mono, fontSize: 9, color: C.muted }}>DAY STREAK</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: apiKey ? C.ok : C.err, boxShadow: `0 0 6px ${apiKey ? C.ok : C.err}` }} />
            <span style={{ fontFamily: mono, fontSize: 11, color: apiKey ? C.ok : C.err }}>{apiKey ? "AI Live" : "No API Key"}</span>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "22px 16px 60px" }}>

        {/* Session Summary Modal */}
        {sessionSummary && (
          <SessionSummary
            summary={sessionSummary}
            onClose={() => setSessionSummary(null)}
            onDrillWeaks={() => { setSessionSummary(null); setTab("weakqueue"); setActiveDomainPack(null); }}
          />
        )}

        <ApiKeyBanner apiKey={apiKey} onSet={setApiKey} />
        <StatsPanel progress={progress} onResetProgress={resetProgress} />

        {/* Domain Pack Selector */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontFamily: mono, fontSize: 9, color: C.muted, letterSpacing: "0.12em", marginBottom: 8 }}>DOMAIN PACKS</div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {Object.values(DOMAIN_PACKS).map(pack => {
              const isActive = activeDomainPack?.id === pack.id;
              const doneCount = Object.entries(progress.allTimeScores)
                .filter(([k, v]) => k.startsWith(`domain-${pack.id}:`) && v === "strong").length;
              return (
                <button key={pack.id} onClick={() => {
                  setActiveDomainPack(isActive ? null : pack);
                  if (!isActive) setTab("domain");
                }} style={{
                  display: "flex", alignItems: "center", gap: 6, padding: "6px 12px",
                  background: isActive ? pack.color : "transparent",
                  color: isActive ? C.bg : pack.color,
                  border: `1.5px solid ${pack.color}`, borderRadius: 6,
                  fontFamily: mono, fontSize: 11, fontWeight: 600, cursor: "pointer",
                }}>
                  {pack.icon} {pack.label}
                  {doneCount > 0 && (
                    <span style={{ background: isActive ? "rgba(0,0,0,0.2)" : pack.color + "22", borderRadius: 3, padding: "1px 5px", fontSize: 9 }}>
                      {doneCount}✓
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Core Module selector */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }}>
          {MODULES.map(m => {
            const sortedCards = sortCardsBySpacedRep(FLASHCARDS[m.id] || [], m.id, progress);
            return (
              <button key={m.id} onClick={() => { setModule(m.id); setTab("flashcards"); setActiveDomainPack(null); }} style={{
                display: "flex", alignItems: "center", gap: 7, padding: "7px 14px",
                background: module === m.id && tab !== "domain" ? m.color : "transparent",
                color: module === m.id && tab !== "domain" ? C.bg : m.color,
                border: `1.5px solid ${m.color}`, borderRadius: 7,
                fontFamily: mono, fontSize: 12, fontWeight: 600,
                cursor: "pointer", letterSpacing: "0.04em",
              }}>
                {m.icon} {m.label}
                <span style={{ background: module === m.id && tab !== "domain" ? "rgba(0,0,0,0.2)" : m.color + "20", borderRadius: 3, padding: "1px 5px", fontSize: 10 }}>
                  {(FLASHCARDS[m.id] || []).length}
                </span>
              </button>
            );
          })}
        </div>

        {/* Tab switcher */}
        <div style={{ display: "flex", gap: 2, background: C.surface, padding: 3, borderRadius: 8, border: `1px solid ${C.border}`, marginBottom: 22, overflowX: "auto" }}>
          {[
            { id: "flashcards", label: "Cards" },
            { id: "coding", label: "Code" },
            { id: "quickfire", label: "⚡ Fire" },
            { id: "weakqueue", label: `🎯 Drill${(progress.weakQueue||[]).length > 0 ? ` (${progress.weakQueue.length})` : ""}` },
            { id: "interview", label: "🎙 Sim" },
            { id: "sqlprep", label: "📋 SQL Prep" },
            { id: "coach", label: "◈ Coach" },
            { id: "kpi", label: "📊 Intel" },
            ...(activeDomainPack ? [{ id: "domain", label: `${activeDomainPack.icon} ${activeDomainPack.label}` }] : []),
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              flex: "0 0 auto", padding: "7px 10px",
              background: tab === t.id ? (t.id === "coach" ? "#e879f9" : activeDomainPack && t.id === "domain" ? activeDomainPack.color : color) : "transparent",
              color: tab === t.id ? C.bg : C.muted,
              border: "none", borderRadius: 6,
              fontFamily: mono, fontSize: 10, fontWeight: 700,
              cursor: "pointer", letterSpacing: "0.02em", whiteSpace: "nowrap",
            }}>{t.label}</button>
          ))}
        </div>

        {tab === "flashcards" && <FlashcardMode key={module + "-f"} module={module} apiKey={apiKey} progress={progress} onScore={handleScore} onSessionDone={handleSessionDone} />}
        {tab === "coding"     && <CodingMode    key={module + "-c"} module={module} apiKey={apiKey} onScore={handleScore} />}
        {tab === "quickfire"  && <QuickFireMode key="qf" apiKey={apiKey} onScore={handleScore} onSessionComplete={() => handleSessionDone({ mode: "Quick-Fire", questionsAnswered: 25, strong: 0, partial: 0, weak: 0, durationMin: Math.round((Date.now() - sessionStart) / 60000), topMissed: [] })} />}
        {tab === "weakqueue"  && <WeakQueueMode key="wq" apiKey={apiKey} progress={progress} onScore={handleScore} />}
        {tab === "interview"  && <InterviewSimMode key="iv" apiKey={apiKey} onSessionComplete={handleSessionComplete} />}
        {tab === "sqlprep"   && <SQLPrepMode key="sqlprep" apiKey={apiKey} onScore={handleScore} />}
        {tab === "coach"      && <AnalyticsCoach key="coach" apiKey={apiKey} />}
        {tab === "domain" && activeDomainPack && (
          <DomainPackMode
            key={`domain-${activeDomainPack.id}`}
            pack={activeDomainPack}
            apiKey={apiKey}
            progress={progress}
            onScore={handleScore}
            onSessionDone={handleSessionDone}
          />
        )}
        {tab === "kpi" && <IntelMode key="kpi" apiKey={apiKey} progress={progress} onScore={handleScore} />}

        <div style={{ marginTop: 36, padding: "13px 18px", background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, fontFamily: mono, fontSize: 11, color: C.muted, lineHeight: 1.7 }}>
          <span style={{ color: C.accent }}>TIP: </span>
          Write your answer first. Then hit Check. The AI evaluates before you peek. That's the whole game — honest reps.
        </div>
      </div>
    </div>
  );
}
