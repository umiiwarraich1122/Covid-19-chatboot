__20 highly realistic user queries : __

__Group 1: Acute COVID\-19 \(Doc 1\)__

- __Query 1 \(Patient\):__ *"I just tested positive for COVID\-19 and I have asthma\. What are the outpatient medication options to keep me out of the hospital?"*
- __Query 2 \(Clinical\):__ *"What is the standard inpatient management protocol for a hospitalized COVID\-19 patient requiring supplemental oxygen?"*
- __Query 3 \(Caregiver\):__ *"What are the most common symptoms of an active COVID infection, and when do they become severe enough to look like ARDS?"*
- __Query 4 \(Clinical\):__ *"What specific inflammatory biomarkers and chest imaging findings support a diagnosis of severe acute COVID\-19?"*

__Group 2: COVID\-19 in Pregnancy \(Doc 2\)__

- __Query 5 \(Patient\):__ *"I am 20 weeks pregnant and just tested positive for COVID\. Can I pass the virus directly to my unborn baby?"*
- __Query 6 \(Clinical\):__ *"What is the target SpO2 for a symptomatic pregnant patient with COVID\-19, and why is this threshold different?"*
- __Query 7 \(Patient/Caregiver\):__ *"Why are pregnant women at a higher risk for severe complications if they catch COVID\-19?"*
- __Query 8 \(Clinical\):__ *"What is the recommended fetal monitoring and ultrasound schedule for a patient infected with SARS\-CoV\-2 during her first trimester?"*

__Group 3: COVID\-19 Vaccines \(Doc 3\)__

- __Query 9 \(Patient\):__ *"How do the mRNA vaccines like Pfizer or Moderna actually work inside my body to build immunity?"*
- __Query 10 \(Patient\):__ *"Are there any groups of people who absolutely cannot get the COVID\-19 vaccine due to allergies?"*
- __Query 11 \(Clinical\):__ *"What are the rare but serious adverse events associated with mRNA and adenoviral vector vaccine platforms?"*
- __Query 12 \(Patient\):__ *"If the COVID vaccine doesn't completely stop me from getting infected as new variants emerge, why should I still get it?"*

__Group 4: MIS\-C in Children \(Doc 4\)__

- __Query 13 \(Caregiver\):__ *"My 10\-year\-old had mild COVID a month ago\. Now they have a persistent high fever, bloodshot eyes, and severe stomach pain\. What should I do?"*
- __Query 14 \(Clinical\):__ *"What are the diagnostic criteria and mandatory cardiac investigations required to confirm a diagnosis of MIS\-C?"*
- __Query 15 \(Clinical\):__ *"What is the first\-line pharmacotherapy regimen for a pediatric patient admitted to the PICU with MIS\-C?"*
- __Query 16 \(Clinical\):__ *"What are the underlying pathophysiological mechanisms that trigger MIS\-C weeks after an initial SARS\-CoV\-2 infection?"*

__Group 5: Post\-COVID\-19 / Long COVID \(Doc 5\)__

- __Query 17 \(Patient\):__ *"It’s been 4 months since I had COVID, but I’m still exhausted and get 'brain fog' constantly\. Could this be Long COVID, and how is it diagnosed?"*
- __Query 18 \(Patient\):__ *"What is post\-exertional malaise \(PEM\), and why am I told to avoid 'push\-and\-crash' exercise cycles?"*
- __Query 19 \(Clinical\):__ *"What is the proposed pathophysiology behind Long COVID? Is it caused by persistent virus or autoimmunity?"*
- __Query 20 \(Clinical\):__ *"What pharmacotherapeutic options are used to manage POTS and neuroinflammation in patients with post\-COVID syndrome?"*

## __Baseline Before Improving Retriever :__

Query

Precision

Recall

MRR

NDCG

Q1

0\.67

0\.67

0\.50

0\.53

Q2

0\.67

1\.00

1\.00

0\.92

Q3

0\.67

0\.67

1\.00

0\.70

Q4

0\.67

1\.00

1\.00

1\.00

Q5

0\.33

0\.50

1\.00

0\.61

Q6

0\.67

1\.00

1\.00

0\.92

Q7

1\.00

0\.33

1\.00

1\.00

Q8

1\.00

1\.00

1\.00

1\.00

Q9

0\.33

1\.00

1\.00

1\.00

Q10

0\.67

1\.00

1\.00

1\.00

Q11

0\.67

1\.00

1\.00

1\.00

Q12

0\.67

0\.67

1\.00

0\.70

Q13

0\.67

0\.40

1\.00

0\.77

Q14

1\.00

0\.43

1\.00

1\.00

Q15

0\.67

0\.40

1\.00

0\.77

Q16

1\.00

0\.75

1\.00

1\.00

Q17

1\.00

0\.60

1\.00

1\.00

Q18

1\.00

0\.50

1\.00

1\.00

Q19

0\.67

1\.00

1\.00

0\.92

Q20

0\.33

0\.33

1\.00

0\.47

## __Measure After Dense Search__

__Query__

__Precision__

__Recall__

__MRR__

__NDCG__

__Latency__

__Q1__

__0\.67__

__1\.00__

__0\.50__

__0\.69__

__1\.71s__

__Q2__

__0\.67__

__1\.00__

__1\.00__

__0\.92__

__1\.77s__

__Q3__

__0\.67__

__1\.00__

__1\.00__

__0\.92__

__1\.36s__

__Q4__

__0\.67__

__1\.00__

__1\.00__

__1\.00__

__1\.49s__

__Q5__

__0\.33__

__1\.00__

__1\.00__

__1\.00__

__0\.61s__

__Q6__

__0\.33__

__1\.00__

__1\.00__

__1\.00__

__1\.40s__

__Q7__

__1\.00__

__1\.00__

__1\.00__

__1\.00__

__1\.83s__

__Q8__

__0\.33__

__1\.00__

__1\.00__

__1\.00__

__1\.48s__

__Q9__

__0\.00__

__0\.00__

__0\.00__

__0\.00__

__0\.37s__

__Q10__

__0\.33__

__1\.00__

__1\.00__

__1\.00__

__0\.49s__

__Q11__

__0\.67__

__1\.00__

__1\.00__

__0\.92__

__1\.40s__

__Q12__

__0\.67__

__1\.00__

__1\.00__

__0\.92__

__0\.95s__

__Q13__

__0\.33__

__1\.00__

__0\.50__

__0\.63__

__1\.77s__

__Q14__

__1\.00__

__1\.00__

__1\.00__

__1\.00__

__1\.53s__

__Q15__

__0\.67__

__1\.00__

__1\.00__

__0\.92__

__1\.16s__

__Q16__

__0\.00__

__0\.00__

__0\.00__

__0\.00__

__0\.79s__

__Q17__

__1\.00__

__1\.00__

__1\.00__

__1\.00__

__1\.63s__

__Q18__

__0\.33__

__1\.00__

__0\.50__

__0\.63__

__0\.59s__

__Q19__

__1\.00__

__1\.00__

__1\.00__

__1\.00__

__1\.47s__

__Q20__

__0\.33__

__1\.00__

__1\.00__

__1\.00__

__0\.92s__

## __Measure After Hybrid Search__

__Query__

__Precision__

__Recall__

__MRR__

__NDCG__

__Latency__

__Q1__

__0\.33__

__1\.00__

__0\.33__

__0\.50__

__1\.72s__

__Q2__

__0\.67__

__1\.00__

__1\.00__

__1\.00__

__0\.75s__

__Q3__

__0\.67__

__1\.00__

__1\.00__

__1\.00__

__1\.19s__

__Q4__

__0\.67__

__1\.00__

__1\.00__

__1\.00__

__1\.54s__

__Q5__

__1\.00__

__1\.00__

__1\.00__

__1\.00__

__1\.03s__

__Q6__

__0\.67__

__1\.00__

__1\.00__

__0\.92__

__1\.96s__

__Q7__

__1\.00__

__1\.00__

__1\.00__

__1\.00__

__1\.27s__

__Q8__

__0\.33__

__1\.00__

__1\.00__

__1\.00__

__1\.47s__

__Q9__

__0\.33__

__1\.00__

__1\.00__

__1\.00__

__1\.52s__

__Q10__

__0\.67__

__1\.00__

__1\.00__

__0\.92__

__0\.84s__

__Q11__

__0\.67__

__1\.00__

__1\.00__

__0\.92__

__1\.37s__

__Q12__

__0\.33__

__1\.00__

__1\.00__

__1\.00__

__1\.44s__

__Q13__

__0\.67__

__1\.00__

__1\.00__

__1\.00__

__1\.29s__

__Q14__

__1\.00__

__1\.00__

__1\.00__

__1\.00__

__0\.99s__

__Q15__

__0\.67__

__1\.00__

__1\.00__

__0\.92__

__0\.67s__

__Q16__

__0\.67__

__1\.00__

__1\.00__

__1\.00__

__1\.25s__

__Q17__

__0\.67__

__1\.00__

__1\.00__

__1\.00__

__0\.94s__

__Q18__

__0\.67__

__1\.00__

__1\.00__

__1\.00__

__1\.40s__

__Q19__

__0\.67__

__1\.00__

__1\.00__

__1\.00__

__0\.74s__

__Q20__

__0\.33__

__1\.00__

__1\.00__

__1\.00__

__1\.24s__

## __Measure After Query Rewrite__

__Query__

__Precision__

__Recall__

__MRR__

__NDCG__

__Latency__

__Q1__

__0\.67__

__1\.00__

__0\.50__

__0\.69__

__3\.89s__

__Q2__

__0\.67__

__1\.00__

__1\.00__

__0\.92__

__3\.27s__

__Q3__

__0\.00__

__0\.00__

__0\.00__

__0\.00__

__1\.28s__

__Q4__

__0\.67__

__1\.00__

__1\.00__

__1\.00__

__3\.01s__

__Q5__

__0\.33__

__1\.00__

__0\.50__

__0\.63__

__2\.22s__

__Q6__

__0\.67__

__1\.00__

__1\.00__

__0\.92__

__2\.88s__

__Q7__

__0\.67__

__1\.00__

__1\.00__

__1\.00__

__2\.27s__

__Q8__

__0\.33__

__1\.00__

__1\.00__

__1\.00__

__2\.86s__

__Q9__

__0\.00__

__0\.00__

__0\.00__

__0\.00__

__1\.89s__

__Q10__

__0\.33__

__1\.00__

__1\.00__

__1\.00__

__2\.08s__

__Q11__

__0\.00__

__0\.00__

__0\.00__

__0\.00__

__1\.09s__

__Q12__

__0\.33__

__1\.00__

__1\.00__

__1\.00__

__2\.67s__

__Q13__

__0\.00__

__0\.00__

__0\.00__

__0\.00__

__1\.29s__

__Q14__

__1\.00__

__1\.00__

__1\.00__

__1\.00__

__3\.87s__

__Q15__

__0\.00__

__0\.00__

__0\.00__

__0\.00__

__1\.10s__

__Q16__

__0\.67__

__1\.00__

__1\.00__

__1\.00__

__11\.15s__

__Q17__

__0\.00__

__0\.00__

__0\.00__

__0\.00__

__1\.44s__

__Q18__

__0\.67__

__1\.00__

__0\.50__

__0\.69__

__2\.41s__

__Q19__

__0\.00__

__0\.00__

__0\.00__

__0\.00__

__1\.57s__

__Q20__

__0\.67__

__1\.00__

__1\.00__

__0\.92__

__2\.23s__

## __Measure After Reranker__

__Query__

__Precision__

__Recall__

__MRR__

__NDCG__

__Latency__

__Q1__

__0\.67__

__1\.00__

__1\.00__

__1\.00__

__2\.82s__

__Q2__

__0\.67__

__1\.00__

__1\.00__

__1\.00__

__2\.79s__

__Q3__

__0\.67__

__1\.00__

__1\.00__

__1\.00__

__2\.08s__

__Q4__

__0\.67__

__1\.00__

__1\.00__

__1\.00__

__1\.82s__

__Q5__

__0\.67__

__1\.00__

__1\.00__

__1\.00__

__1\.11s__

__Q6__

__1\.00__

__1\.00__

__1\.00__

__1\.00__

__1\.97s__

__Q7__

__1\.00__

__1\.00__

__1\.00__

__1\.00__

__1\.62s__

__Q8__

__0\.67__

__1\.00__

__1\.00__

__1\.00__

__2\.47s__

__Q9__

__0\.00__

__0\.00__

__0\.00__

__0\.00__

__0\.00s__

__Q10__

__0\.33__

__1\.00__

__1\.00__

__1\.00__

__1\.62s__

__Q11__

__0\.67__

__1\.00__

__1\.00__

__0\.92__

__1\.01s__

__Q12__

__0\.67__

__1\.00__

__1\.00__

__0\.92__

__2\.27s__

__Q13__

__1\.00__

__1\.00__

__1\.00__

__1\.00__

__1\.70s__

__Q14__

__0\.67__

__1\.00__

__1\.00__

__1\.00__

__1\.53s__

__Q15__

__0\.67__

__1\.00__

__1\.00__

__0\.92__

__1\.19s__

__Q16__

__1\.00__

__1\.00__

__1\.00__

__1\.00__

__1\.55s__

__Q17__

__1\.00__

__1\.00__

__1\.00__

__1\.00__

__2\.08s__

__Q18__

__0\.67__

__1\.00__

__1\.00__

__0\.92__

__1\.94s__

__Q19__

__1\.00__

__1\.00__

__1\.00__

__1\.00__

__1\.88s__

__Q20__

__0\.67__

__1\.00__

__1\.00__

__0\.92__

__1\.77s__

