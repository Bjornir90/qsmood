<template>
    <v-container>

        <v-row justify="center">

            <v-col cols="12" md="6">
                <v-card class="d-flex flex-column">

                    <v-card-title>Happiness overtime</v-card-title>
                    <line-chart v-if="happinessLoaded" :chart-data="happinessData" :options="happinessOptions"></line-chart>
                    <v-progress-circular v-else indeterminate :size="100" class="align-self-center"></v-progress-circular>


                </v-card>
            </v-col>
        
            <v-col cols="12" md="6">
                <v-card class="d-flex flex-column">

                    <v-card-title>Happiness per weekday</v-card-title>
                    <bar-chart v-if="happinessWeekdayLoaded" :chart-data="happinessWeekdayData" :options="happinessWeekdayOptions"></bar-chart>
                    <v-progress-circular v-else indeterminate :size="100" class="align-self-center"></v-progress-circular>


                </v-card>
            </v-col>

        </v-row>

        <v-row justify="center">
            <v-col cols="12" md="4">
                <v-card class="d-flex flex-column">
                    <v-card-title>Upload pixel file</v-card-title>
                    <v-file-input
                        accept="application/json, .json"
                        label="File input"
                        v-model="file"
                    ></v-file-input>

                    <v-btn @click="uploadFile">Upload</v-btn>
                </v-card>
            </v-col>
            <v-col cols="12" md="4">
                <v-card class="d-flex flex-column">
                    <v-card-title>Statistics</v-card-title>
                    
                </v-card>
            </v-col>
        </v-row>

    </v-container>
</template>

<script lang="ts">
import Vue from 'vue'
import LineChart from '../components/LineChart.vue'
import BarChart from '../components/BarChart.vue'

const weekday: any = new Array(7);
weekday[0] = "Sunday";
weekday[1] = "Monday";
weekday[2] = "Tuesday";
weekday[3] = "Wednesday";
weekday[4] = "Thursday";
weekday[5] = "Friday";
weekday[6] = "Saturday";

function computeMean(array: number[]){
    let sum = 0;

    array.forEach((n: number) => sum += n);

    return sum/array.length;    
}

export default Vue.extend({
    components: {
        LineChart,
        BarChart
    },
    data: () => {
        return {
            file: null,
            happinessData: {
                labels: [],
                datasets: [{
                    label: "",
                    data: [] as any[],
                    borderColor: '#BFDBF7',
                    backgroundColor: '#EDF5FD'
                }]
            },
            happinessWeekdayData: {
                labels: [],
                datasets: [{
                    label: "",
                    data: [] as any[],
                    borderColor: '#BFDBF7',
                    backgroundColor: '#EDF5FD'
                }]
            },
            happinessOptions: {
                scales: {
                    yAxes: [{
                        ticks: {
                            min: 0,
                            max: 5
                        }
                    }]
                }
            },
            happinessWeekdayOptions: {
                scales: {
                    yAxes: [{
                        ticks: {
                            min: 0,
                            max: 5
                        }
                    }]
                }
            },
            /*happinessData: {
                labels: ["2020-10-09", "2020-10-10"],
                datasets: [
                    {
                        label: "Happiness",
                        data: [3, 4]
                    }
                ]
            },*/
            startDateHappiness: "2020-10-01",
            endDateHappiness: "2020-10-30",
            happinessLoadFailed: false,
            happinessLoaded: false,
            happinessWeekdayLoadFailed: false,
            happinessWeekdayLoaded: false
        }
    },

    mounted: function () {
        this.happinessLoadFailed = false;
        this.happinessLoaded = false;
        this.happinessWeekdayLoadFailed = false;
        this.happinessWeekdayLoaded = false;
        this.$http.get(`${process.env.VUE_APP_API_URL}/api/days/range/${this.startDateHappiness}/${this.endDateHappiness}`).then((response: any) => {
            const formattedData = response.data.map((o: any) => o.moodscore);

            const labels = response.data.map((o: any) => o.date);

            this.happinessData.datasets[0].label = "Happiness";
            this.happinessData.datasets[0].data = formattedData;
            this.happinessData.labels = labels;
            this.happinessLoaded = true;

        }, (err: any) => this.happinessLoadFailed = true);

        this.$http.get(`${process.env.VUE_APP_API_URL}/api/days/last/100`).then((response: any) => {

            this.happinessWeekdayData.labels = weekday;
            this.happinessWeekdayData.datasets[0].label = "Mean happiness";

            const happinessPerDay: number[][] = [];

            for (let index = 0; index < weekday.length; index++) {
                happinessPerDay[index] = [];
            }
            
            response.data.forEach((o: any) => {
                happinessPerDay[new Date(o.date).getDay()].push(o.moodscore);
            });

            const meanHappinessPerDay: number[] = [];

            for (let index = 0; index < weekday.length; index++) {
                meanHappinessPerDay[index] = computeMean(happinessPerDay[index]);
            }

            this.happinessWeekdayData.datasets[0].data = meanHappinessPerDay;
            this.happinessWeekdayLoaded = true;

        }, (error: any) => this.happinessWeekdayLoadFailed = true);
    },

    methods: {
        uploadFile: function() {
            const file: File = this.file!;//To calm down compiler
            file.text().then((s: string) => {
                this.$http.post(`${process.env.VUE_APP_API_URL}/api/pixel`, s).then((response: any) => {
                    alert("File uploaded");
                }, (error: any) => {
                    alert("Could not upload file "+error);
                })
            });
        }
    }

})
</script>