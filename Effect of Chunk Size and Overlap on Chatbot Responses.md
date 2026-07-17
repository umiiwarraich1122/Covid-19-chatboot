# <a id="Xcd23a74a89e3f04141467d9ed536aec72cb9bf9"></a>Effect of Chunk Size and Overlap on Chatbot Responses

## <a id="introduction"></a>Introduction

To evaluate the performance of my Retrieval\-Augmented Generation \(RAG\) chatbot, I uploaded __five documents related to COVID\-19__ into the knowledge base\. For testing purposes, I also uploaded an additional document about __Pakistan__ \(Pakistan\.md\)\. I then asked the chatbot the following question:

__Question:__ *“Tell me about Pakistan\.”*

To analyze how chunking parameters affect retrieval quality and response generation, I experimented with different __Chunk Size__ and __Chunk Overlap__ values\. The following sections present the results and observations\.

# <a id="experiment-1-chunk-size-30-overlap-5"></a>Experiment 1: Chunk Size = 30, Overlap = 5

## <a id="configuration"></a>Configuration

- __Chunk Size:__ 30
- __Chunk Overlap:__ 5

## <a id="result"></a>Result

- __Total Chunks Created:__ 51

### <a id="chatbot-response"></a>Chatbot Response

According to Document 1 \(Pakistan\.md\), Pakistan is a beautiful and diverse country located in South Asia, which came into existence on 14 August 1947 after gaining independence from British rule\. As stated in Document 2 \(Pakistan\.md\), the country gained independence under the leadership of Quaid\-e\-Azam Muhammad Ali Jinnah and shares its borders with India, China, Afghanistan, and Iran, with the Arabian Sea to its south\. Additionally, as mentioned in Document 3 \(Pakistan\.md\), Pakistan is a country with attractions such as northern mountains, historical forts, ancient archaeological sites, colorful festivals, and traditional hospitality, with its people known for their warmth, generosity, and respect for guests\.

### <a id="observation"></a>Observation

- The document was divided into many very small chunks\.
- Information became fragmented across multiple chunks\.
- The chatbot retrieved information from several documents to answer a simple question\.
- The response was relatively short and lacked detailed context\.

# <a id="experiment-2-chunk-size-30-overlap-10"></a>Experiment 2: Chunk Size = 30, Overlap = 10

## <a id="configuration-1"></a>Configuration

- __Chunk Size:__ 30
- __Chunk Overlap:__ 10

## <a id="result-1"></a>Result

- __Total Chunks Created:__ 63

### <a id="chatbot-response-1"></a>Chatbot Response

According to Document 1 \(Pakistan\.md\), Pakistan is a beautiful and diverse country located in South Asia, which came into existence on __14 August 1947__ after gaining independence from British rule under the leadership of __Quaid\-e\-Azam Muhammad Ali Jinnah__\. The country shares its borders with India, China, Afghanistan, and Iran, while the Arabian Sea lies to its south\. The capital city of Pakistan is __Islamabad__, and its largest city is __Karachi__, which is also the country’s economic hub\. Pakistan has a population of over __240 million people__, making it one of the most populous countries in the world\. As stated in Document 1 \(Pakistan\.md\), the national language is __Urdu__, while __English__ is widely used in education, business, and government\. People across the country also speak many regional languages, including Punjabi, Sindhi, Pashto, Balochi, Saraiki, Hindko, and others, reflecting the rich cultural diversity of the nation\. According to Document 3 \(Pakistan\.md\), Pakistani food is famous for its rich flavors and spices\. Education plays a vital role in Pakistan’s development\. The country has also made significant contributions in science, technology, medicine, sports, and defense, while continuing to face challenges such as poverty, unemployment, inflation, climate change, water scarcity, and educational inequalities\.

### <a id="observation-1"></a>Observation

- Increasing the overlap produced more chunks\.
- More contextual information was preserved between adjacent chunks\.
- The chatbot generated a richer and more informative answer\.
- Some redundant information appeared because neighboring chunks contained overlapping content\.

# <a id="experiment-3-chunk-size-150-overlap-20"></a>Experiment 3: Chunk Size = 150, Overlap = 20

## <a id="configuration-2"></a>Configuration

- __Chunk Size:__ 150
- __Chunk Overlap:__ 20

## <a id="result-2"></a>Result

- __Total Chunks Created:__ 10

### <a id="chatbot-response-2"></a>Chatbot Response

According to Document 1 \(Pakistan\.md\), Pakistan is a beautiful and diverse country located in South Asia\. It gained independence on __14 August 1947__ under the leadership of __Quaid\-e\-Azam Muhammad Ali Jinnah__\. The country shares borders with India, China, Afghanistan, and Iran and has a population of over __240 million__ people\. The response also highlights Pakistan’s rich history, cultural heritage, national languages, education system, and historical sites such as Mohenjo\-daro, Harappa, Taxila, Rohtas Fort, Lahore Fort, and Badshahi Mosque\. The chatbot also notes that some retrieved documents contained duplicate information without adding new knowledge\.

### <a id="observation-2"></a>Observation

- Larger chunks preserved complete paragraphs and context\.
- Fewer chunks were generated, making retrieval more efficient\.
- The chatbot produced a coherent and well\-structured response\.
- Less redundancy was observed compared to smaller chunk sizes\.

# <a id="experiment-4-chunk-size-500-overlap-50"></a>Experiment 4: Chunk Size = 500, Overlap = 50

## <a id="configuration-3"></a>Configuration

- __Chunk Size:__ 500
- __Chunk Overlap:__ 50

## <a id="result-3"></a>Result

- __Total Chunks Created:__ 3

### <a id="chatbot-response-3"></a>Chatbot Response

According to Document 1 \(Pakistan\.md\), Pakistan is a beautiful and diverse country located in South Asia\. It gained independence on __14 August 1947__ under the leadership of __Quaid\-e\-Azam Muhammad Ali Jinnah__\. The chatbot also describes Pakistan’s geography, population, languages, major cities, and breathtaking natural beauty, including the Karakoram, Himalaya, Hindu Kush mountain ranges, fertile plains, deserts, and Arabian Sea coastline\.

### <a id="observation-3"></a>Observation

- Very large chunks significantly reduced the number of chunks\.
- Each retrieved chunk contained extensive contextual information\.
- The chatbot generated a smooth and natural response\.
- However, if a query targets a very specific fact, retrieving such large chunks may introduce unnecessary information and reduce retrieval precision\.

# <a id="comparison-of-chunking-results"></a>Comparison of Chunking Results

Chunk Size

Overlap

Chunks Created

Response Quality

Observation

30

5

51

Basic

Information fragmented across many chunks\.

30

10

63

Good

Better context but more redundancy due to overlap\.

150

20

10

Very Good

Balanced context, fewer chunks, and coherent responses\.

500

50

3

Good

Rich context but lower retrieval precision for specific queries\.

# <a id="overall-analysis"></a>Overall Analysis

The experiments demonstrate that __Chunk Size__ and __Chunk Overlap__ have a significant impact on Retrieval\-Augmented Generation \(RAG\) systems\.

Small chunk sizes generate a large number of chunks, increasing retrieval operations and often splitting related information into separate chunks\. Increasing overlap helps preserve context but also increases redundancy\. Medium\-sized chunks provide a balance between retrieval accuracy and contextual completeness, resulting in more coherent responses\. Very large chunks reduce the total number of chunks and preserve extensive context, but they may retrieve unnecessary information for focused questions\.

# <a id="summary"></a>Summary

This experiment shows that selecting appropriate chunking parameters is essential for building an effective RAG chatbot\. Among the tested configurations, __Chunk Size = 150__ with __Overlap = 20__ produced the best balance between context preservation, retrieval efficiency, and response quality\. Small chunk sizes \(30\) resulted in fragmented information and a higher number of chunks, while very large chunk sizes \(500\) preserved context but reduced retrieval precision\. Therefore, a __moderate chunk size with a reasonable overlap__ is generally recommended to achieve accurate, coherent, and efficient responses in document\-based chatbot systems\.

